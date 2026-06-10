import { generateEmailFromLinkedinPost } from "../utils/ai.email-service.js"


export const getGeneratedAiResponse = async(req,res)=>{
    try {
        const {description} = req.body
        const aiResponse = await generateEmailFromLinkedinPost(description)
        const hrEmail = aiResponse.hrEmail

        const trackingLinks = {
  github: `${process.env.BACKEND_URL}/api/track/click/${hrEmail}/github`,
  linkedin: `${process.env.BACKEND_URL}/api/track/click/${hrEmail}/linkedin`,
  portfolio: `${process.env.BACKEND_URL}/api/track/click/${hrEmail}/portfolio`,
  resume: `${process.env.BACKEND_URL}/api/track/click/${hrEmail}/resume`,
};

const finalBody = aiResponse.emailBody
  .replace("{{GITHUB_LINK}}", trackingLinks.github)
  .replace("{{LINKEDIN_LINK}}", trackingLinks.linkedin)
  .replace("{{PORTFOLIO_LINK}}", trackingLinks.portfolio)
  .replace("{{RESUME_LINK}}", trackingLinks.resume);
        return res.status(200).json({success:true,data:finalBody})
    } catch (error) {
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

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
    "base64"
  );

  res.set("Content-Type", "image/gif");
  res.send(pixel);
};

export const trackClick = async (req, res) => {
  const { emailId, type } = req.params;

  const links = {
    github: "https://github.com/PrashantMaurya252",
    linkedin: "https://linkedin.com/in/pkm252",
    portfolio:
      "https://e-commerce-with-postgre-and-prisma.vercel.app",
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