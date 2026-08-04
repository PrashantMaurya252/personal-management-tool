import mongoose,{Schema} from "mongoose";

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    otp:{
        type:String,
    },
    otpExpiresAt:{
        type:Date
    }
})

const UserModel = mongoose.model("User",UserSchema)
export default UserModel