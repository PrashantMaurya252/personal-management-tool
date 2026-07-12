import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import { connectToDB } from './utils/connectTodb.js'
import jobEmailRoutes from './routes/job-email.js'
import companyRoutes from './routes/company.routes.js'
import hiringManagerRoutes from './routes/hiring-manager.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import jobOpeningRoutes from './routes/job-opening.routes.js'
import scoutSettingsRoutes from './routes/scout-settings.routes.js'

const app = express()

app.use(express.json())
app.use(cors(
    {
        origin:process.env.NODE_ENV === "production" ? process.env.DEPLOYED_FRONTEND_URL  : process.env.DEVELOPMENT_FRONTEND_URL,
        credentials:true
    }
))
app.use(cookieParser())

app.use("/api/v1",authRoutes)
app.use("/api/v1/emails", jobEmailRoutes)
app.use("/api/v1",companyRoutes)
app.use("/api/v1",hiringManagerRoutes)
app.use("/api/v1",resumeRoutes)
app.use("/api/v1",jobOpeningRoutes)
app.use("/api/v1",scoutSettingsRoutes)

export default app