import { generateEmailFromLinkedinPost } from "../utils/ai.email-service.js"


export const getGeneratedAiResponse = async(req,res)=>{
    try {
        const {description} = req.body
        const aiResponse = await generateEmailFromLinkedinPost(description)
        return res.status(200).json({success:true,data:aiResponse})
    } catch (error) {
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}