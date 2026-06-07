import express from 'express'
import { login, logout, signup } from '../controllers/auth.controller.js'

const  authRoutes = express.Router()

authRoutes.post("/auth/signup",signup)
authRoutes.post("/auth/login",login)
authRoutes.post("/auth/logout",logout)

export default authRoutes


