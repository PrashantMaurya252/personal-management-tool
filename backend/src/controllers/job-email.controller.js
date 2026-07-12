import EmailModel from "../model/job-email.model.js";
import ResumeModel from "../model/resume.model.js";
import CompanyModel from "../model/company.model.js";
import HiringManagerModel from "../model/hiring-managers.js";
import { sendEmail } from "../service/service.js";
import { generateEmailFromLinkedinPost } from "../utils/ai.email-service.js";

export const getGeneratedAiResponse = async (req, res) => {
  try {
    const { description } = req.body;
    
    // 1. Fetch Resume
    const resume = await ResumeModel.findOne({ userId: req.userId });
    if (!resume || !resume.extractedData) {
      return res.status(400).json({ success: false, message: "Please upload and parse your resume in the Resume tab first." });
    }

    // 2. Generate AI Response
    const aiResponse = await generateEmailFromLinkedinPost(description, resume.extractedData);
    
    return res.status(200).json({ success: true, data: aiResponse });
  } catch (error) {
    console.error("Error in getGeneratedAiResponse:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const sendtoHR = async (req, res) => {
  try {
    const { email, subject, body, companyName, hrName, profile } = req.body;
    
    if (!email || !subject || !body) {
      return res.status(400).json({ success: false, message: "Email, Subject and Body are required" });
    }

    // Upsert Company
    let companyId = null;
    if (companyName) {
      let company = await CompanyModel.findOne({ 
        name: companyName.toLowerCase(),
        userId: req.userId
      });
      if (!company) {
        company = await CompanyModel.create({
          name: companyName.toLowerCase(),
          userId: req.userId,
          status: "not_applied",
          companyType: "Product"
        });
      }
      companyId = company._id;
    }

    // Upsert HR Manager
    let hrId = null;
    if (email && companyId) {
      let hrManager = await HiringManagerModel.findOne({
        email: email.toLowerCase(),
        userId: req.userId
      });
      if (!hrManager) {
        hrManager = await HiringManagerModel.create({
          name: hrName || "HR Manager",
          email: email.toLowerCase(),
          company: companyId,
          userId: req.userId
        });
      }
      hrId = hrManager._id;
    }

    // Check valid references
    const emailData = {
      userId: req.userId,
      profile: profile || "Full Stack Developer",
      generatedSubject: subject,
      generatedBody: body,
      status: "draft"
    };

    if (companyId && companyId !== "null") emailData.company = companyId;
    if (hrId && hrId !== "null") emailData.recipientEmail = hrId;

    const newEmail = await EmailModel.create(emailData);

    let attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer
      });
    }

    const emailIdStr = newEmail._id.toString();
    const trackingLinks = {
      github: `${process.env.BACKEND_URL}/api/v1/emails/track/click/${emailIdStr}/github`,
      linkedin: `${process.env.BACKEND_URL}/api/v1/emails/track/click/${emailIdStr}/linkedin`,
      portfolio: `${process.env.BACKEND_URL}/api/v1/emails/track/click/${emailIdStr}/portfolio`,
      resume: `${process.env.BACKEND_URL}/api/v1/emails/track/click/${emailIdStr}/resume`,
    };

    let finalBody = body
      .replace(/\{\{GITHUB_LINK\}\}/g, `<a href="${trackingLinks.github}" target="_blank">GitHub Profile</a>`)
      .replace(/\{\{LINKEDIN_LINK\}\}/g, `<a href="${trackingLinks.linkedin}" target="_blank">LinkedIn Profile</a>`)
      .replace(/\{\{PORTFOLIO_LINK\}\}/g, `<a href="${trackingLinks.portfolio}" target="_blank">Portfolio</a>`)
      .replace(/\{\{RESUME_LINK\}\}/g, `<a href="${trackingLinks.resume}" target="_blank">Download Resume</a>`);

    finalBody = finalBody.replace(/\n/g, "<br>");

    const pixelUrl = `${process.env.BACKEND_URL}/api/v1/emails/track/open/${emailIdStr}`;
    finalBody += `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`;

    const result = await sendEmail({
      email,
      subject,
      body: finalBody,
      attachments
    });

    if (!result.success) {
      await EmailModel.findByIdAndUpdate(newEmail._id, { status: "failed" });
      return res.status(500).json({ success: false, message: "Failed to send email via SMTP" });
    }

    await EmailModel.findByIdAndUpdate(newEmail._id, { 
      status: "sent",
      sentAt: new Date()
    });

    res.status(200).json({ success: true, message: "Email Sent Successfully", data: newEmail });
  } catch (error) {
    console.error("Send To HR Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const trackEmailOpen = async (req, res) => {
  try {
    const { emailId } = req.params;

    await EmailModel.findByIdAndUpdate(emailId, {
      $set: { "tracking.isOpened": true },
      $inc: { "tracking.openedCount": 1 },
      $push: { "tracking.openedAt": new Date() },
    });

    const pixel = Buffer.from(
      "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
      "base64"
    );

    res.set("Content-Type", "image/gif");
    res.send(pixel);
  } catch (error) {
    res.status(500).send("Error");
  }
};

export const trackClick = async (req, res) => {
  try {
    const { emailId, type } = req.params;

    // Ideally these links would be dynamically fetched from the user's profile
    // But for now we can fallback to standard ones or fetch ResumeModel
    const emailRecord = await EmailModel.findById(emailId);
    let urlToRedirect = "https://github.com";

    if (emailRecord && emailRecord.userId) {
      const resume = await ResumeModel.findOne({ userId: emailRecord.userId });
      if (resume && resume.extractedData) {
        if (type === 'github' && resume.extractedData.github) urlToRedirect = resume.extractedData.github;
        if (type === 'linkedin' && resume.extractedData.linkedin) urlToRedirect = resume.extractedData.linkedin;
        if (type === 'portfolio' && resume.extractedData.portfolio) urlToRedirect = resume.extractedData.portfolio;
        if (type === 'resume' && resume.extractedData.resumeLink) urlToRedirect = resume.extractedData.resumeLink;
      }
    }

    await EmailModel.findByIdAndUpdate(emailId, {
      $push: {
        "tracking.linkClicks": {
          url: type,
          clickedAt: new Date(),
          ipAddress: req.ip || "unknown",
        },
      },
    });

    res.redirect(urlToRedirect);
  } catch (error) {
    res.status(500).send("Error tracking link");
  }
};

export const getEmailHistory = async (req, res) => {
  try {
    const emails = await EmailModel.find({ userId: req.userId })
      .populate("company")
      .populate("recipientEmail")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: emails });
  } catch (error) {
    console.error("Fetch Emails Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch emails" });
  }
};