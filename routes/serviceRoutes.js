// backend/routes/serviceRoutes.js

import express from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  updateServiceOrder,
} from "../controllers/serviceController.js";
import { uploadServiceImages } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getServices);
router.get("/:id", getServiceById);

// Admin routes (with authentication middleware if you have it)
router.post("/", uploadServiceImages, createService);
router.put("/:id", uploadServiceImages, updateService);
router.delete("/:id", deleteService);
router.patch("/:id/order", updateServiceOrder);

export default router;