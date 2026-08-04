import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getResumes, updateResumeData, uploadResume, deleteResume, setDefaultResume } from "../controllers/resume.controller.js";
import upload from "../middleware/multer.js";

const resumeRoutes = express.Router();

resumeRoutes.post("/resume/upload", protectRoute, upload.single("resume"), uploadResume);
resumeRoutes.get("/resume", protectRoute, getResumes);
resumeRoutes.put("/resume/data/:id", protectRoute, updateResumeData);
resumeRoutes.put("/resume/default/:id", protectRoute, setDefaultResume);
resumeRoutes.delete("/resume/:id", protectRoute, deleteResume);

export default resumeRoutes;
