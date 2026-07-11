import express from "express";
import {
  addHiringManager,
  getHiringManagers,
  getHiringManagerById,
  updateHiringManager,
  deleteHiringManager,
} from "../controllers/hiring-manager.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const hiringManagerRoutes = express.Router();

hiringManagerRoutes.use("/hiring-managers", protectRoute);

hiringManagerRoutes.post("/hiring-managers", addHiringManager);
hiringManagerRoutes.get("/hiring-managers", getHiringManagers);
hiringManagerRoutes.get("/hiring-managers/:id", getHiringManagerById);
hiringManagerRoutes.put("/hiring-managers/:id", updateHiringManager);
hiringManagerRoutes.delete("/hiring-managers/:id", deleteHiringManager);

export default hiringManagerRoutes;
