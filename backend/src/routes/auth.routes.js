import express from 'express'
import { login, logout, signup, forgotPassword, resetPassword } from '../controllers/auth.controller.js'

const  authRoutes = express.Router()

authRoutes.post("/auth/signup",signup)
authRoutes.post("/auth/login",login)
authRoutes.post("/auth/logout",logout)
authRoutes.post("/auth/forgot-password",forgotPassword)
authRoutes.post("/auth/reset-password",resetPassword)

export default authRoutes
