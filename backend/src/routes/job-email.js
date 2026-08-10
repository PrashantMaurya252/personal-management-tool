import express from 'express'
import multer from 'multer'
import { getGeneratedAiResponse, sendtoHR, getEmailHistory, bulkEnquiry, updateScheduledEmail, cancelScheduledEmail } from '../controllers/job-email.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const jobEmailRoutes = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

jobEmailRoutes.get("/", protectRoute, getEmailHistory)
jobEmailRoutes.post("/generate-email", protectRoute, getGeneratedAiResponse)
jobEmailRoutes.post("/send-hr-email", protectRoute, upload.single("resumePdf"), sendtoHR)
jobEmailRoutes.post("/bulk-enquiry", protectRoute, upload.single("resumePdf"), bulkEnquiry)
jobEmailRoutes.put("/:id", protectRoute, updateScheduledEmail)
jobEmailRoutes.delete("/:id", protectRoute, cancelScheduledEmail)



export default jobEmailRoutes