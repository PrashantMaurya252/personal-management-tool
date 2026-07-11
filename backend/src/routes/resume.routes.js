import express from "express";
import multer from "multer";
import { uploadResume, getResume } from "../controllers/resume.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const resumeRoutes = express.Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

resumeRoutes.use("/resume", protectRoute);

resumeRoutes.post("/resume/upload", upload.single("resume"), uploadResume);
resumeRoutes.get("/resume", getResume);

export default resumeRoutes;
