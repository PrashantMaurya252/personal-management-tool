import dotenv from 'dotenv'
dotenv.config()
import app from './src/app.js'
import { connectToDB } from './src/utils/connectTodb.js'

connectToDB()
const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Your backend runs on port ${process.env.PORT}`)
})