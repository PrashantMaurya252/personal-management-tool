import cron from "node-cron";
import { chromium } from "playwright";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ScoutSettingsModel from "../model/scout-settings.model.js";
import CompanyModel from "../model/company.model.js";
import ResumeModel from "../model/resume.model.js";
import JobOpeningModel from "../model/job-opening.model.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

const scrapeAndFilter = async (url, desiredRoles) => {
  let browser;
  try {
    // Launch headless playwright
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set a reasonable timeout and go to URL
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Get text content of the page
    const pageText = await page.evaluate(() => document.body.innerText);
    const htmlContent = await page.evaluate(() => document.body.innerHTML);
    
    await browser.close();

    // Use Gemini to analyze the page text
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an AI assistant that finds job openings on career pages. 
      The user is looking for roles that match any of these desired roles: ${desiredRoles.join(", ")}.
      
      Here is the raw text from a company's career page:
      """
      ${pageText.substring(0, 50000)} // truncate to prevent token limits
      """
      
      Find if there are any job openings matching the desired roles. 
      If there are, return a JSON array of objects with strictly the following format:
      [
        {
          "jobTitle": "Exact Title of the Job",
          "applyLink": "The URL to apply for the job (if available in the text or use ${url})"
        }
      ]
      
      If there are no matching roles, return an empty array [].
      Return ONLY valid JSON without markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    let extractedText = result.response.text().trim();
    
    // Clean up potential markdown formatting
    if (extractedText.startsWith("\`\`\`json")) {
      extractedText = extractedText.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    } else if (extractedText.startsWith("\`\`\`")) {
      extractedText = extractedText.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    try {
      return JSON.parse(extractedText);
    } catch (e) {
      console.error("Failed to parse Gemini response", extractedText);
      return [];
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    if (browser) await browser.close();
    return [];
  }
};

const runScoutForUser = async (userId) => {
  try {
    const resume = await ResumeModel.findOne({ userId });
    const desiredRoles = resume?.extractedData?.desiredRoles || [];
    
    if (desiredRoles.length === 0) return;

    const companies = await CompanyModel.find({ userId, isScoutEnabled: true });
    
    for (const company of companies) {
      if (!company.companyCareerPage) continue;
      
      console.log(`Scouting ${company.name} for user ${userId}`);
      const openings = await scrapeAndFilter(company.companyCareerPage, desiredRoles);
      
      for (const opening of openings) {
        // Check if we already found this job recently
        const existing = await JobOpeningModel.findOne({
          userId,
          companyId: company._id,
          jobTitle: opening.jobTitle
        });
        
        if (!existing) {
          await JobOpeningModel.create({
            userId,
            companyId: company._id,
            jobTitle: opening.jobTitle,
            applyLink: opening.applyLink || company.companyCareerPage,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error running scout for user ${userId}:`, error.message);
  }
};

export const initializeScoutCron = () => {
  // Since users have customizable time slots, we can run a global cron every hour
  // and check if that hour matches any user's setting
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      // Format as HH:00
      const currentSlot = `${now.getHours().toString().padStart(2, '0')}:00`;
      
      console.log(`[Job Scout] Running schedule for slot: ${currentSlot}`);
      
      const activeSettings = await ScoutSettingsModel.find({
        isActive: true,
        timeSlots: currentSlot
      });
      
      for (const setting of activeSettings) {
        // Run asynchronously so we don't block
        runScoutForUser(setting.userId).catch(e => console.error(e));
      }
    } catch (error) {
      console.error("[Job Scout] Cron error:", error);
    }
  });
};
