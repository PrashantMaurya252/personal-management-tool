import bcrypt from "bcrypt";
import UserModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      // Return true anyway to prevent email enumeration, but for now we'll send 404 for UX
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.log("forgotPassword error", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and New Password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log("resetPassword error", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
