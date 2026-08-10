import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.route("/").get(getNotifications);
router.route("/read-all").put(markAllAsRead);
router.route("/:id/read").put(markAsRead);

export default router;
