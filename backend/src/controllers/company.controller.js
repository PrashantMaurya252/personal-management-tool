import CompanyModel from "../model/company.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import * as xlsx from "xlsx";

export const uploadCompaniesExcel = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No Excel file uploaded", 400);
    }

    // Read the Excel file buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON array
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // Map data to match the schema
    const companiesToInsert = rawData.map((row) => ({
      userId: req.userId,
      name: row.name || row.Name || row.Company || "Unknown",
      website: row.website || row.Website || "",
      linkedinUrl: row.linkedinUrl || row.Linkedin || "",
      industry: row.industry || row.Industry || "",
      location: row.location || row.Location || "",
      companySize: row.companySize || row.Size || undefined,
      notes: row.notes || row.Notes || "",
      status: row.status ? row.status.toLowerCase() : "not_applied",
      companyType: row.companyType || row.Type || undefined,
      companyCareerPage: row.companyCareerPage || row.CareerPage || "",
    }));

    // Save to database
    const insertedCompanies = await CompanyModel.insertMany(companiesToInsert);

    return successResponse(
      res,
      `${insertedCompanies.length} companies uploaded successfully`,
      insertedCompanies,
      201
    );
  } catch (error) {
    console.error("Error uploading companies excel:", error);
    return errorResponse(res, error.message);
  }
};

export const createCompany = async (req, res) => {
  try {
    const company = await CompanyModel.create({
      ...req.body,
      userId: req.userId
    });

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
    const companies = await CompanyModel.find({ userId: req.userId });

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