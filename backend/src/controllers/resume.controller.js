import ResumeModel from "../model/resume.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import Groq from "groq-sdk";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No resume file uploaded", 400);
    }

    // Check limit
    const existingResumesCount = await ResumeModel.countDocuments({ userId: req.userId });
    if (existingResumesCount >= 3) {
      return errorResponse(res, "Maximum limit of 3 resumes reached. Please delete one before uploading.", 400);
    }

    // Pass PDF to Gemini as inlineData
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      Extract the following information from the attached resume PDF and return it strictly as a JSON object without any markdown wrapping (no \`\`\`json).
      Include these fields if available: 
      - "name": string
      - "email": string
      - "phone": string
      - "github": string (url if present)
      - "linkedin": string (url if present)
      - "portfolio": string (url if present)
      - "skills": array of strings
      - "experience": array of objects { "company": string, "role": string, "duration": string }
      - "education": array of objects { "institution": string, "degree": string, "duration": string }
    `;

    let extractedText = "";
    
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: req.file.buffer.toString("base64"),
            mimeType: "application/pdf"
          }
        }
      ]);
      extractedText = result.response.text().trim();
    } catch (aiError) {
      if (aiError.status === 429 || (aiError.message && aiError.message.includes("429"))) {
        console.log("Gemini limit reached. Falling back to Groq...");
        
        // Extract text from PDF using pdf-parse
        const pdfData = await pdfParse(req.file.buffer);
        const pdfText = pdfData.text;

        const groqPrompt = `
${prompt}

Here is the extracted text from the resume:
${pdfText}
`;

        const groqCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: groqPrompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          max_tokens: 1024,
        });

        extractedText = groqCompletion.choices[0]?.message?.content || "";
        extractedText = extractedText.trim();
      } else {
        throw aiError;
      }
    }

    // Clean up potential markdown formatting
    if (extractedText.startsWith("```json")) {
      extractedText = extractedText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (extractedText.startsWith("```")) {
      extractedText = extractedText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    let extractedData = {};
    try {
      extractedData = JSON.parse(extractedText);
    } catch (parseError) {
      console.log("Failed to parse AI response as JSON", extractedText);
    }

    // Upload to Cloudinary
    const filename = "resume_" + req.userId + "_" + Date.now();
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, filename);

    // Save to database
    const isDefault = existingResumesCount === 0; // First one is default

    const resume = await ResumeModel.create({
      userId: req.userId,
      extractedData,
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      fileName: req.file.originalname,
      isDefault
    });

    return successResponse(
      res,
      "Resume uploaded successfully",
      resume,
      201
    );
  } catch (error) {
    console.error("Error in uploadResume:", error);

    return errorResponse(res, "Failed to parse resume with AI. Please try again later.");
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await ResumeModel.find({ userId: req.userId }).sort({ createdAt: -1 });
    return successResponse(res, "Resumes fetched successfully", resumes);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateResumeData = async (req, res) => {
  try {
    const { id } = req.params;
    const { github, linkedin, portfolio, desiredRoles, experience } = req.body;
    
    // If no ID is passed, maybe they are trying to update the default? 
    // It's safer to require the ID now since they have multiple.
    const query = id ? { _id: id, userId: req.userId } : { userId: req.userId, isDefault: true };
    const resume = await ResumeModel.findOne(query);
    
    if (!resume) {
      return errorResponse(res, "Resume not found", 404);
    }
    
    // Ensure extractedData exists
    if (!resume.extractedData) {
      resume.extractedData = {};
    }

    resume.extractedData = {
      ...resume.extractedData,
      github: github !== undefined ? github : resume.extractedData.github,
      linkedin: linkedin !== undefined ? linkedin : resume.extractedData.linkedin,
      portfolio: portfolio !== undefined ? portfolio : resume.extractedData.portfolio,
      desiredRoles: desiredRoles !== undefined ? desiredRoles : resume.extractedData.desiredRoles || [],
      experience: experience !== undefined ? experience : resume.extractedData.experience || [],
    };
    
    resume.markModified('extractedData');
    await resume.save();
    return successResponse(res, "Resume data updated successfully", resume);
  } catch (error) {
    console.error("Update Resume Data Error:", error);
    return errorResponse(res, error.message);
  }
};

export const setDefaultResume = async (req, res) => {
  try {
    const { id } = req.params;
    // Unset all existing defaults for this user
    await ResumeModel.updateMany({ userId: req.userId }, { $set: { isDefault: false } });
    // Set the new default
    const resume = await ResumeModel.findOneAndUpdate({ _id: id, userId: req.userId }, { $set: { isDefault: true } }, { new: true });
    
    if (!resume) return errorResponse(res, "Resume not found", 404);
    
    return successResponse(res, "Default resume updated", resume);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await ResumeModel.findOne({ _id: id, userId: req.userId });
    if (!resume) return errorResponse(res, "Resume not found", 404);

    if (resume.publicId) {
      await deleteFromCloudinary(resume.publicId);
    }
    
    await ResumeModel.deleteOne({ _id: id });
    
    // If it was the default, make another one default if it exists
    if (resume.isDefault) {
       const another = await ResumeModel.findOne({ userId: req.userId });
       if (another) {
         another.isDefault = true;
         await another.save();
       }
    }

    return successResponse(res, "Resume deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
