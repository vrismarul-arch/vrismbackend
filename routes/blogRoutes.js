import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createBlog,
  getAllBlogs,
  getPublicBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  bulkAction,
  getBlogStats,
  addComment,
  toggleLike,
} from "../controllers/blogController.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `blog-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// ================= ADMIN ROUTES =================
router.get("/admin/stats", getBlogStats);
router.post("/admin/bulk-action", bulkAction);
router.post("/admin/create", upload.single("featuredImage"), createBlog);
router.get("/admin", getAllBlogs);
router.get("/admin/:id", getBlogById);
router.put("/admin/:id", upload.single("featuredImage"), updateBlog);
router.delete("/admin/:id", deleteBlog);

// ================= PUBLIC ROUTES =================
router.get("/public", getPublicBlogs);
router.get("/public/slug/:slug", getBlogBySlug);
router.post("/public/:id/comments", addComment);
router.post("/public/:id/like", toggleLike);

export default router;