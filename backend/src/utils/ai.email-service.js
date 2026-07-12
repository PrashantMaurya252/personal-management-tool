import dotenv from 'dotenv'
dotenv.config()

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getSystemPrompt = (resumeData) => {
  const profileString = typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData, null, 2);

  return `
You are an expert technical recruiter and career coach.

You have access to the user's complete profile and resume data:

---
${profileString}
---

IMPORTANT RULES:

1. Analyze the job description carefully.
2. Extract company details from the job post.
3. Compare required skills with the user's ACTUAL skills.
4. ONLY mention skills, technologies, projects, and experiences that are explicitly present in the user's resume data and are relevant to the job.
5. NEVER mention unrelated skills.
6. NEVER hallucinate or invent skills the user does not have.
7. If the role requires more experience than the user has, do NOT lie.
8. Instead, highlight:
   - Relevant projects from their profile
   - Similar work experience
   - Ability to learn quickly

EMAIL RULES:

1. Email should be CONCISE, direct, and highly professional.
2. Get straight to the point about why the user is a great fit.
3. Highlight only relevant experience and skills that match the job.
4. Keep the email between 150-250 words. Do not ramble.
5. Emphasize transferable experience and ability to learn quickly if there's a skill mismatch.
6. Include contact information based on their resume data.

SIGNATURE FORMAT:

Best Regards,
[User's Name from Resume]
[User's Title from Resume]

Phone: [User's Phone from Resume]
Email: [User's Email from Resume]

IMPORTANT TRACKING LINKS:

You must conditionally append links to the signature ONLY IF they exist in the user's resume data. Use the exact placeholders below:

${resumeData.github ? "GitHub: {{GITHUB_LINK}}" : ""}
${resumeData.linkedin ? "LinkedIn: {{LINKEDIN_LINK}}" : ""}
${resumeData.portfolio ? "Portfolio: {{PORTFOLIO_LINK}}" : ""}
Resume: {{RESUME_LINK}}

Do not include social links if they are not in the resume data.

Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.

{
  "companyName":"",
  "jobTitle":"",
  "location":"",
  "hrName":"",
  "hrEmail":"",
  "hrPhone":"",
  "experienceRequired":"",
  "requiredSkills":[],
  "matchedSkills":[],
  "missingSkills":[],
  "matchPercentage":0,
  "emailSubject":"",
  "emailBody":""
}
`;
};

const generateWithGemini = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return extractJson(text);
};

const extractJson = (text) => {
  try {
    const cleaned = text
      .replace(/\`\`\`json/g, "")
      .replace(/\`\`\`/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("AI Output:", text);
    throw new Error("Failed to parse AI response into JSON");
  }
};

export const generateEmailFromLinkedinPost = async (
  linkedinJobPost,
  resumeData
) => {
  const systemPrompt = getSystemPrompt(resumeData);

  const prompt = `${systemPrompt}

LINKEDIN JOB POST:

${linkedinJobPost}
`;

  try {
    return await generateWithGemini(prompt);
  } catch (error) {
    console.error("Gemini failed:", error);
    throw error;
  }
};