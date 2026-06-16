import EmailModel from "../model/job-email.model.js";
import { sendEmail } from "../service/service.js";
import { generateEmailFromLinkedinPost } from "../utils/ai.email-service.js";

export const getGeneratedAiResponse = async (req, res) => {
  try {
    const { description } = req.body;
    const aiResponse = await generateEmailFromLinkedinPost(description);
    const hrEmail = aiResponse.hrEmail;

    const trackingLinks = {
      github: `${process.env.BACKEND_URL}/api/v1/track/click/${hrEmail}/github`,
      linkedin: `${process.env.BACKEND_URL}/api/v1/track/click/${hrEmail}/linkedin`,
      portfolio: `${process.env.BACKEND_URL}/api/v1/track/click/${hrEmail}/portfolio`,
      resume: `${process.env.BACKEND_URL}/api/v1/track/click/${hrEmail}/resume`,
    };

    const replacedLinks = aiResponse.emailBody
  .replace(
    "{{GITHUB_LINK}}",
    `<a href="${trackingLinks.github}" target="_blank">GitHub Profile</a>`
  )
  .replace(
    "{{LINKEDIN_LINK}}",
    `<a href="${trackingLinks.linkedin}" target="_blank">LinkedIn Profile</a>`
  )
  .replace(
    "{{PORTFOLIO_LINK}}",
    `<a href="${trackingLinks.portfolio}" target="_blank">Portfolio</a>`
  )
  .replace(
    "{{RESUME_LINK}}",
    `<a href="${trackingLinks.resume}" target="_blank">Download Resume</a>`
  );
    const finalBody = {...aiResponse,emailBody:replacedLinks}
    return res.status(200).json({ success: true, data: finalBody });
  } catch (error) {
    console.log("Error",error)
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const trackEmailOpen = async (req, res) => {
  const { emailId } = req.params;

  await EmailModel.findByIdAndUpdate(emailId, {
    $set: {
      "tracking.isOpened": true,
    },
    $inc: {
      "tracking.openedCount": 1,
    },
    $push: {
      "tracking.openedAt": new Date(),
    },
  });

  const pixel = Buffer.from(
    "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
    "base64",
  );

  res.set("Content-Type", "image/gif");
  res.send(pixel);
};

export const trackClick = async (req, res) => {
  const { emailId, type } = req.params;

  const links = {
    github: "https://github.com/PrashantMaurya252",
    linkedin: "https://linkedin.com/in/pkm252",
    portfolio: "https://e-commerce-with-postgre-and-prisma.vercel.app",
  };

  await EmailModel.findByIdAndUpdate(emailId, {
    $push: {
      "tracking.linkClicks": {
        url: type,
        clickedAt: new Date(),
        ipAddress: req.ip,
      },
    },
  });

  res.redirect(links[type]);
};


export const sendtoHR=async(req,res)=>{
  try {
    const {email,subject,body} = req.body
    if(!email || !subject || !body){
      return res.status(404).json({success:false,message:"Email,Subject and Body is required"})
    }

    const result = await sendEmail({
      email,
      subject,
      body,
    });
    if(!result.success){
      return res.status(401).json({success:false,message:"Something went wrong while sending email"})
    }
    res.status(200).json({success:true,message:"Email Sent Successfully"})
  } catch (error) {
    console.log("Send To HR Error")
    return res.status(500).json({message:"Internal server error",success:false})
  }
}