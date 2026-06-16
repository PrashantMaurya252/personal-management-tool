import express from 'express'
import { getGeneratedAiResponse, sendtoHR, trackClick, trackEmailOpen } from '../controllers/job-email.controller.js'

const jobEmailRoutes = express.Router()

jobEmailRoutes.post("/generate-email",getGeneratedAiResponse)
jobEmailRoutes.post("/send-hr-email",sendtoHR)
jobEmailRoutes.get("/track/open/:emailId",trackEmailOpen)
jobEmailRoutes.get("/track/click/:emailId/:type",trackClick)

export default jobEmailRoutes