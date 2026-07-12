import express from "express";
import { getScoutSettings, updateScoutSettings, runManualScout } from "../controllers/scout-settings.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const scoutSettingsRoutes = express.Router();

scoutSettingsRoutes.use(protectRoute);

scoutSettingsRoutes.get("/scout-settings", getScoutSettings);
scoutSettingsRoutes.put("/scout-settings", updateScoutSettings);
scoutSettingsRoutes.post("/scout-settings/run", runManualScout);

export default scoutSettingsRoutes;
