import express from "express";
import multer from "multer";
import {
  createApplication,
  getApplications,
  getApplicationsByJob,
  getApplicationById,
  updateApplicationStatus,
  bulkUpdateStatus,
  deleteApplication,
  getApplicationStats,
  resendConfirmationEmail,
  exportApplicationsCSV,
} from "../controllers/applicationController.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Public routes
router.post("/create", upload.single("resume"), createApplication);

// Admin routes
router.get("/admin", getApplications);
router.get("/admin/stats", getApplicationStats);
router.get("/admin/export", exportApplicationsCSV);
router.get("/admin/job/:jobId", getApplicationsByJob);
router.get("/admin/:id", getApplicationById);
router.put("/admin/:id/status", updateApplicationStatus);
router.post("/admin/bulk-status", bulkUpdateStatus);
router.delete("/admin/:id", deleteApplication);
router.post("/admin/:id/resend-email", resendConfirmationEmail);

export default router;