import express from "express";
import { getJobOpenings, updateJobOpeningStatus } from "../controllers/job-opening.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const jobOpeningRoutes = express.Router();

jobOpeningRoutes.use(protectRoute);

jobOpeningRoutes.get("/job-openings", getJobOpenings);
jobOpeningRoutes.put("/job-openings/:id/status", updateJobOpeningStatus);

export default jobOpeningRoutes;
