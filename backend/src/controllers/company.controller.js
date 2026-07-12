import CompanyModel from "../model/company.model.js";
import HiringManagerModel from "../model/hiring-managers.js";
import JobApplicationModel from "../model/job-application.js";
import JobOpeningModel from "../model/job-opening.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import * as xlsx from "xlsx";

const mapCompanySize = (sizeStr) => {
  if (!sizeStr) return undefined;
  
  const s = String(sizeStr).trim().toLowerCase();
  
  // Exact matches for the allowed enums
  if (["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].includes(s)) return s;

  // Custom user rules
  if (s.includes("10000") || s.includes("10k")) return "1000+";
  if (s === "500+" || s === "500 +" || s.includes("500-1000") || s.includes("501-1000")) return "501-1000";

  // Generic fallback by parsing the first number found
  const match = s.match(/\d+/g);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num > 1000) return "1000+";
    if (num > 500) return "501-1000";
    if (num > 200) return "201-500";
    if (num > 50) return "51-200";
    if (num > 10) return "11-50";
    return "1-10";
  }
  
  return undefined;
};

const mapCompanyType = (typeStr) => {
  if (!typeStr) return undefined;
  const t = String(typeStr).trim();
  const lower = t.toLowerCase();
  if (lower === 'product') return 'Product';
  if (lower === 'service') return 'Service';
  return ["Product", "Service"].includes(t) ? t : undefined;
};

const mapStatus = (statusStr) => {
  if (!statusStr) return "not_applied";
  const s = String(statusStr).trim().toLowerCase().replace(/\s+/g, "_");
  return ["not_applied", "applied", "interview", "rejected", "selected"].includes(s) ? s : "not_applied";
};

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
    const companiesToUpsert = rawData.map((row) => ({
      userId: req.userId,
      name: (row.name || row.Name || row.Company || "Unknown").toLowerCase().trim(),
      website: row.website || row.Website || "",
      linkedinUrl: row.linkedinUrl || row.Linkedin || "",
      industry: row.industry || row.Industry || "",
      location: row.location || row.Location || "",
      companySize: mapCompanySize(row.companySize || row.Size),
      notes: row.notes || row.Notes || "",
      status: mapStatus(row.status),
      companyType: mapCompanyType(row.companyType || row.Type),
      companyCareerPage: row.companyCareerPage || row.CareerPage || "",
    }));

    // Save to database using bulkWrite for upsert functionality
    const bulkOps = companiesToUpsert.map((companyData) => ({
      updateOne: {
        filter: { userId: companyData.userId, name: companyData.name },
        update: { $set: companyData },
        upsert: true,
      },
    }));

    const result = await CompanyModel.bulkWrite(bulkOps);

    return successResponse(
      res,
      `Processed ${companiesToUpsert.length} companies (${result.upsertedCount} new, ${result.modifiedCount} updated)`,
      null,
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
    const { page = 1, limit = 10, search = "", pagination = "true" } = req.query;
    
    let query = { userId: req.userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    if (pagination === "false") {
      const companies = await CompanyModel.find(query).sort({ createdAt: -1 });
      return successResponse(res, "Companies fetched successfully", { companies });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const total = await CompanyModel.countDocuments(query);
    const companies = await CompanyModel.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return successResponse(
      res,
      "Companies fetched successfully",
      {
        companies,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
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

export const updateBulkScoutStatus = async (req, res) => {
  try {
    const { companyIds, isScoutEnabled } = req.body;
    
    if (!Array.isArray(companyIds)) {
      return errorResponse(res, "companyIds must be an array", 400);
    }

    await CompanyModel.updateMany(
      { _id: { $in: companyIds }, userId: req.userId },
      { $set: { isScoutEnabled } }
    );

    return successResponse(res, "Companies updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await CompanyModel.findByIdAndDelete(req.params.id);

    if (!company) {
      return errorResponse(res, "Company not found", 404);
    }

    // Cascade delete associated data
    await HiringManagerModel.deleteMany({ company: req.params.id });
    await JobApplicationModel.deleteMany({ company: req.params.id });
    await JobOpeningModel.deleteMany({ companyId: req.params.id });

    return successResponse(res, "Company and all associated data deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};