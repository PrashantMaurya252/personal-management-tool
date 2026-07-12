import ScoutSettingsModel from "../model/scout-settings.model.js";
import { runScoutForUser } from "../services/jobScout.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getScoutSettings = async (req, res) => {
  try {
    let settings = await ScoutSettingsModel.findOne({ userId: req.userId });
    
    if (!settings) {
      // Create default settings if they don't exist
      settings = await ScoutSettingsModel.create({
        userId: req.userId,
        timeSlots: ["10:00", "13:00", "16:00", "18:00"],
        isActive: true,
      });
    }

    return successResponse(res, "Scout settings fetched successfully", settings);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateScoutSettings = async (req, res) => {
  try {
    const { timeSlots, isActive } = req.body;
    
    let settings = await ScoutSettingsModel.findOne({ userId: req.userId });
    
    if (!settings) {
      settings = new ScoutSettingsModel({ userId: req.userId });
    }

    if (timeSlots !== undefined) settings.timeSlots = timeSlots;
    if (isActive !== undefined) settings.isActive = isActive;

    await settings.save();

    return successResponse(res, "Scout settings updated successfully", settings);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const runManualScout = async (req, res) => {
  try {
    await runScoutForUser(req.userId);
    return successResponse(res, "Job Scout ran successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
