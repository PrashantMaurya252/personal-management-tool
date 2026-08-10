import cron from "node-cron";
import { chromium } from "playwright";
import ScoutSettingsModel from "../model/scout-settings.model.js";
import CompanyModel from "../model/company.model.js";
import ResumeModel from "../model/resume.model.js";
import JobOpeningModel from "../model/job-opening.model.js";
import dotenv from "dotenv";

dotenv.config();

const calculateScore = (title, settings, resume) => {
  let score = 0;
  const titleLower = title.toLowerCase();

  // Match roles (high priority)
  if (settings && settings.jobRoles) {
    for (const role of settings.jobRoles) {
      if (titleLower.includes(role.toLowerCase())) score += 5;
    }
  }

  // Match keywords
  if (settings && settings.keywords) {
    for (const kw of settings.keywords) {
      if (titleLower.includes(kw.toLowerCase())) score += 2;
    }
  }

  // Match experience
  if (settings && settings.experienceLevels) {
    for (const exp of settings.experienceLevels) {
      if (titleLower.includes(exp.toLowerCase())) score += 3;
    }
  }

  // Resume matching
  if (resume && resume.rawText) {
    const resumeTextLower = resume.rawText.toLowerCase();
    const titleWords = titleLower.split(/[\s\-_,]+/);
    for (const word of titleWords) {
      if (word.length > 3 && resumeTextLower.includes(word)) {
        score += 1;
      }
    }
  }

  return score;
};

const extractJobLinks = async (url) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Extract all links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(l => l.text && l.href && l.href.startsWith('http'));
    });
    
    await browser.close();
    
    // Basic filter for noise links
    const ignoreWords = [
      'about', 'about us', 'contact', 'contact us', 'privacy', 'privacy policy',
      'terms', 'terms of service', 'home', 'login', 'sign in', 'sign up', 
      'register', 'cookie', 'cookie policy', 'facebook', 'twitter', 'linkedin', 
      'instagram', 'youtube', 'blog', 'careers', 'jobs', 'apply now', 'search',
      'all jobs', 'view all'
    ];
    
    const potentialJobs = links.filter(l => {
      const textLower = l.text.toLowerCase();
      // Filter out links that are too short or too long to be job titles
      if (textLower.length < 5 || textLower.length > 100) return false;
      
      // Exact match for ignore words
      if (ignoreWords.includes(textLower)) return false;
      
      return true;
    });

    // To remove duplicates based on href and text
    const uniqueJobsMap = new Map();
    for (const job of potentialJobs) {
      // Use text + href as unique key just in case same title has different links
      const key = `${job.text}-${job.href}`;
      if (!uniqueJobsMap.has(key)) {
        uniqueJobsMap.set(key, job);
      }
    }
    return Array.from(uniqueJobsMap.values());
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    if (browser) await browser.close();
    return [];
  }
};

export const runScoutForUser = async (userId) => {
  try {
    const settings = await ScoutSettingsModel.findOne({ userId });
    if (!settings || !settings.isActive) return;

    const resume = await ResumeModel.findOne({ userId, isDefault: true }) || await ResumeModel.findOne({ userId });

    const companies = await CompanyModel.find({ userId, isScoutEnabled: true });
    
    for (const company of companies) {
      if (!company.companyCareerPage) continue;
      
      console.log(`Scouting ${company.name} for user ${userId}`);
      const links = await extractJobLinks(company.companyCareerPage);
      
      for (const link of links) {
        const score = calculateScore(link.text, settings, resume);
        
        // If the score is > 0, it means it matched something from the user's preferences or resume
        // We can also have a threshold, but > 0 is fine for now to capture all relevant roles.
        if (score > 0) {
          const existing = await JobOpeningModel.findOne({
            userId,
            companyId: company._id,
            jobTitle: link.text
          });
          
          if (!existing) {
            await JobOpeningModel.create({
              userId,
              companyId: company._id,
              jobTitle: link.text,
              applyLink: link.href,
              matchScore: score
            });
          } else {
            // Update score if it changed
            if (existing.matchScore !== score) {
              existing.matchScore = score;
              await existing.save();
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error running scout for user ${userId}:`, error.message);
  }
};

export const initializeScoutCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const currentSlot = `${now.getHours().toString().padStart(2, '0')}:00`;
      
      console.log(`[Job Scout] Running schedule for slot: ${currentSlot}`);
      
      const activeSettings = await ScoutSettingsModel.find({
        isActive: true,
        timeSlots: currentSlot
      });
      
      for (const setting of activeSettings) {
        runScoutForUser(setting.userId).catch(e => console.error(e));
      }
    } catch (error) {
      console.error("[Job Scout] Cron error:", error);
    }
  });
};
