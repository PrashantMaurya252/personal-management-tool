import express from 'express'
import multer from 'multer'
import { getGeneratedAiResponse, sendtoHR, trackClick, trackEmailOpen, getEmailHistory } from '../controllers/job-email.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const jobEmailRoutes = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

jobEmailRoutes.get("/", protectRoute, getEmailHistory)
jobEmailRoutes.post("/generate-email", protectRoute, getGeneratedAiResponse)
jobEmailRoutes.post("/send-hr-email", protectRoute, upload.single("resumePdf"), sendtoHR)
jobEmailRoutes.get("/track/open/:emailId", trackEmailOpen)
jobEmailRoutes.get("/track/click/:emailId/:type", trackClick)

export default jobEmailRoutes