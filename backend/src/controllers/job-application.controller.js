import JobApplicationModel from "../model/job-application.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createJobApplication = async (req, res) => {
  try {
    const application =
      await JobApplicationModel.create(req.body);

    return successResponse(
      res,
      "Application created successfully",
      application,
      201
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const applications =
      await JobApplicationModel.find();

    return successResponse(
      res,
      "Applications fetched successfully",
      applications
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateApplicationStatus = async (
  req,
  res
) => {
  try {
    const { applicationStatus } = req.body;

    const application =
      await JobApplicationModel.findByIdAndUpdate(
        req.params.id,
        { applicationStatus },
        { new: true }
      );

    return successResponse(
      res,
      "Status updated successfully",
      application
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteApplication = async (
  req,
  res
) => {
  try {
    await JobApplicationModel.findByIdAndDelete(
      req.params.id
    );

    return successResponse(
      res,
      "Application deleted successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};