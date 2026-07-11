import express from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const companyRoutes = express.Router();

companyRoutes.use("/companies", protectRoute);

companyRoutes.post("/companies", createCompany);
companyRoutes.get("/companies", getCompanies);
companyRoutes.get("/companies/:id", getCompanyById);
companyRoutes.put("/companies/:id", updateCompany);
companyRoutes.delete("/companies/:id", deleteCompany);

export default companyRoutes;
