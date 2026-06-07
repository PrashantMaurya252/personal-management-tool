import mongoose from "mongoose";



const profilePromptSchema = new mongoose.Schema({
    name:String,
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    prompt:String
})

export const ProfilePromptModel = mongoose.model("ProfilePrompt",profilePromptSchema)
