import HiringManagerModel from "../model/hiring-managers.js";
import CompanyModel from "../model/company.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import * as xlsx from "xlsx";
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
    const { page = 1, limit = 10, search = "", pagination = "true" } = req.query;
    
    let query = { userId: req.userId };

    if (search) {
      // Find matching companies to allow searching by company name
      const matchingCompanies = await CompanyModel.find({ 
        userId: req.userId, 
        name: { $regex: search, $options: "i" } 
      }).select('_id');
      const companyIds = matchingCompanies.map(c => c._id);

      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { company: { $in: companyIds } }
      ];
    }

    if (pagination === "false") {
      const managers = await HiringManagerModel.find(query)
        .populate("company")
        .sort({ createdAt: -1 });
      return successResponse(res, "Hiring managers fetched successfully", { managers });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const total = await HiringManagerModel.countDocuments(query);
    const managers = await HiringManagerModel.find(query)
      .populate("company")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return successResponse(
      res,
      "Hiring managers fetched successfully",
      {
        managers,
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

export const uploadHiringManagersExcel = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No Excel file uploaded", 400);
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    let addedCount = 0;
    let skippedCount = 0;

    for (const row of rawData) {
      const companyName = (row.company || row.Company || "").toString().trim();
      if (!companyName) continue; // Skip if no company name

      // 1. Find or create company (lowercase comparison)
      let company = await CompanyModel.findOne({ 
        userId: req.userId, 
        name: companyName.toLowerCase() 
      });

      if (!company) {
        company = await CompanyModel.create({
          userId: req.userId,
          name: companyName.toLowerCase(),
          // You can extract other fields if present in the Excel sheet
          industry: row.industry || row.Industry || "",
          location: row.location || row.Location || "",
          status: "not_applied"
        });
      }

      // 2. Extract manager details
      const managerName = (row.name || row.Name || "").toString().trim();
      if (!managerName) continue; // Skip if no manager name

      // 3. Check if manager exists for this company
      const existingManager = await HiringManagerModel.findOne({
        userId: req.userId,
        company: company._id,
        name: managerName
      });

      if (existingManager) {
        skippedCount++;
        continue;
      }

      // 4. Create new manager
      await HiringManagerModel.create({
        userId: req.userId,
        company: company._id,
        name: managerName,
        email: row.email || row.Email || "",
        phone: row.phone || row.Phone || "",
        linkedinUrl: row.linkedinUrl || row.Linkedin || row.LinkedIn || "",
        role: row.role || row.Role || "",
        status: "active"
      });
      addedCount++;
    }

    return successResponse(
      res,
      `Processed hiring managers: ${addedCount} added, ${skippedCount} skipped (already exists).`,
      null,
      201
    );
  } catch (error) {
    console.error("Error uploading hiring managers excel:", error);
    return errorResponse(res, error.message);
  }
};