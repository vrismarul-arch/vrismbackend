import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import serviceRoutes from "./routes/serviceRoutes.js";

dotenv.config();

connectDB();

const app = express();

// CORS
app.use(cors());

// IMPORTANT: Only use express.json() for non-multipart routes
// But since we're using multer, we can keep it as long as multer routes are defined AFTER
// However, multer will handle its own parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES - Multer will handle multipart/form-data automatically
app.use("/api/services", serviceRoutes);

// Test route to check if server is working
app.get("/", (req, res) => {
  res.send("API Running");
});

// Error handling middleware for multer and other errors
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: "File too large. Max size is 5MB"
    });
  }
  
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});