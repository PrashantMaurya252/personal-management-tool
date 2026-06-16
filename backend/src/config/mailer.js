import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'

console.log(process.env.MAIL_USER,process.env.MAIL_PASS)

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

