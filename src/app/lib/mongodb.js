import mongoose from "mongoose"


const MONGO_URI= process.env.MONGODB_URI

if(!MONGO_URI){
    throw new Error("Please define MONGO_URI")
}

export async function ConnectToDB(){
    if(mongoose.connect.readyState >=1){
        return
    }
    await mongoose.connect(MONGO_URI)
}