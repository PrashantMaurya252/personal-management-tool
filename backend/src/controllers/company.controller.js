import CompanyModel from "../model/company.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createCompany = async (req, res) => {
  try {
    const company = await CompanyModel.create(req.body);

    return successResponse(
      res,
      "Company created successfully",
      company,
      201
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await CompanyModel.find();

    return successResponse(
      res,
      "Companies fetched successfully",
      companies
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const company = await CompanyModel.findById(req.params.id);

    if (!company) {
      return errorResponse(
        res,
        "Company not found",
        404
      );
    }

    return successResponse(
      res,
      "Company fetched successfully",
      company
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateCompany = async (req, res) => {
  try {
    const company = await CompanyModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!company) {
      return errorResponse(
        res,
        "Company not found",
        404
      );
    }

    return successResponse(
      res,
      "Company updated successfully",
      company
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await CompanyModel.findByIdAndDelete(
      req.params.id
    );

    if (!company) {
      return errorResponse(
        res,
        "Company not found",
        404
      );
    }

    return successResponse(
      res,
      "Company deleted successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};