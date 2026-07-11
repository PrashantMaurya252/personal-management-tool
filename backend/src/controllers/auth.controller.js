import bcrypt from "bcrypt";
import UserModel from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email,Name,Password are required" });
    }
    const isExist = await UserModel.findOne({ email });
    if (isExist) {
      return res.status(400).json({
        success: false,
        message: "This email already exist",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({ email, name, password: hashedPassword });
    return res
      .status(201)
      .json({ success: true, message: "User signup successfully" });
  } catch (error) {
    console.log("Signup error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ success: true, message: "User Loggedin successfully" });
  } catch (error) {
    console.log("login error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async(req,res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({success:true,message:"User logout successfully"})
    } catch (error) {
        console.log("logout error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
    }
}
