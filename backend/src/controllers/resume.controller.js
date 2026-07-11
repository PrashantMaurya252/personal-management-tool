import ResumeModel from "../model/resume.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No resume file uploaded", 400);
    }

    // Pass PDF to Gemini as inlineData
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      Extract the following information from the attached resume PDF and return it strictly as a JSON object without any markdown wrapping (no \`\`\`json).
      Include these fields if available: 
      - "name": string
      - "email": string
      - "phone": string
      - "skills": array of strings
      - "experience": array of objects { "company": string, "role": string, "duration": string }
      - "education": array of objects { "institution": string, "degree": string, "duration": string }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: "application/pdf"
        }
      }
    ]);

    let extractedText = result.response.text().trim();

    // Clean up potential markdown formatting
    if (extractedText.startsWith("\`\`\`json")) {
      extractedText = extractedText.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    } else if (extractedText.startsWith("\`\`\`")) {
      extractedText = extractedText.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    let extractedData = {};
    try {
      extractedData = JSON.parse(extractedText);
    } catch (parseError) {
      console.log("Failed to parse AI response as JSON", extractedText);
    }

    // 3. Save to database
    let resume = await ResumeModel.findOne({ userId: req.userId });
    if (resume) {
      resume.extractedData = extractedData;
      await resume.save();
    } else {
      resume = await ResumeModel.create({
        userId: req.userId,
        extractedData,
      });
    }

    return successResponse(
      res,
      "Resume uploaded and parsed successfully",
      resume,
      201
    );
  } catch (error) {
    console.error("Error in uploadResume:", error);
    return errorResponse(res, error.message);
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await ResumeModel.findOne({ userId: req.userId });
    if (!resume) {
      return successResponse(res, "No resume found", null);
    }
    return successResponse(res, "Resume fetched successfully", resume);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
