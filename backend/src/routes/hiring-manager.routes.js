import express from "express";
import multer from "multer";
import {
  addHiringManager,
  getHiringManagers,
  getHiringManagerById,
  updateHiringManager,
  deleteHiringManager,
  uploadHiringManagersExcel,
} from "../controllers/hiring-manager.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const hiringManagerRoutes = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

hiringManagerRoutes.use("/hiring-managers", protectRoute);

hiringManagerRoutes.post("/hiring-managers/upload", upload.single("excel"), uploadHiringManagersExcel);
hiringManagerRoutes.post("/hiring-managers", addHiringManager);
hiringManagerRoutes.get("/hiring-managers", getHiringManagers);
hiringManagerRoutes.get("/hiring-managers/:id", getHiringManagerById);
hiringManagerRoutes.put("/hiring-managers/:id", updateHiringManager);
hiringManagerRoutes.delete("/hiring-managers/:id", deleteHiringManager);

export default hiringManagerRoutes;
