import HiringManagerModel from "../model/hiring-managers.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const addHiringManager = async (req, res) => {
  try {
    const hiringManager = await HiringManagerModel.create({
      ...req.body,
      userId: req.userId
    });

    return successResponse(
      res,
      "Hiring manager created successfully",
      hiringManager,
      201
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getHiringManagers = async (req, res) => {
  try {
    const managers = await HiringManagerModel.find({ userId: req.userId })
      .populate("company");

    return successResponse(
      res,
      "Hiring managers fetched successfully",
      managers
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getHiringManagerById = async (req, res) => {
  try {
    const manager = await HiringManagerModel.findById(req.params.id)
      .populate("company");

    if (!manager) {
      return errorResponse(
        res,
        "Hiring manager not found",
        404
      );
    }

    return successResponse(
      res,
      "Hiring manager fetched successfully",
      manager
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateHiringManager = async (req, res) => {
  try {
    const manager = await HiringManagerModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!manager) {
      return errorResponse(
        res,
        "Hiring manager not found",
        404
      );
    }

    return successResponse(
      res,
      "Hiring manager updated successfully",
      manager
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteHiringManager = async (req, res) => {
  try {
    const manager = await HiringManagerModel.findByIdAndDelete(
      req.params.id
    );

    if (!manager) {
      return errorResponse(
        res,
        "Hiring manager not found",
        404
      );
    }

    return successResponse(
      res,
      "Hiring manager deleted successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};