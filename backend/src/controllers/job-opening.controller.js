import JobOpeningModel from "../model/job-opening.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getJobOpenings = async (req, res) => {
  try {
    const { date } = req.query;
    
    let filter = { userId: req.userId };
    
    // Filter by specific date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      filter.dateFound = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const jobOpenings = await JobOpeningModel.find(filter)
      .populate("companyId", "name website logo")
      .sort({ dateFound: -1 });

    return successResponse(res, "Job openings fetched successfully", jobOpenings);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateJobOpeningStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const jobOpening = await JobOpeningModel.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { status },
      { new: true }
    );

    if (!jobOpening) {
      return errorResponse(res, "Job opening not found", 404);
    }

    return successResponse(res, "Job opening status updated", jobOpening);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
