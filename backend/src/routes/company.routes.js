import express from "express";
import multer from "multer";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  uploadCompaniesExcel,
  updateBulkScoutStatus
} from "../controllers/company.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const companyRoutes = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

companyRoutes.use("/companies", protectRoute);

companyRoutes.post("/companies/upload", upload.single("excel"), uploadCompaniesExcel);
companyRoutes.post("/companies", createCompany);
companyRoutes.get("/companies", getCompanies);
companyRoutes.get("/companies/:id", getCompanyById);
companyRoutes.put("/companies/bulk/scout", updateBulkScoutStatus);
companyRoutes.put("/companies/:id", updateCompany);
companyRoutes.delete("/companies/:id", deleteCompany);

export default companyRoutes;
