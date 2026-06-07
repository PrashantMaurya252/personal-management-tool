import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import { connectToDB } from './utils/connectTodb.js'

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


export default app