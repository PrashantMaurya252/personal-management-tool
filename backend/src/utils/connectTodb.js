import mongoose from 'mongoose'


export const connectToDB = async()=>{
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected successfully")
    } catch (error) {
        throw new Error("Unable to coonect to database")
        process.exit(1)
    }
}