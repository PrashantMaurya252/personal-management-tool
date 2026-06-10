import express from 'express'
import { getGeneratedAiResponse } from '../controllers/job-email.controller.js'

const jobEmailRoutes = express.Router()

jobEmailRoutes.post("/generate-email",getGeneratedAiResponse)

export default jobEmailRoutes