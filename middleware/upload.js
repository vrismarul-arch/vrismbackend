// backend/middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 50 // Max 50 files total
  },
  fileFilter: fileFilter
});

// Export the configured multer middleware - Updated with all possible field names
export const uploadServiceImages = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "icon", maxCount: 1 },
  { name: "gallery", maxCount: 20 },
  { name: "galleryImages", maxCount: 20 }, // Added to handle both field names
  { name: "problemsWeSolveImages", maxCount: 20 },
  { name: "ourApproachImages", maxCount: 20 },
  { name: "keyBenefitsImages", maxCount: 20 }
]);