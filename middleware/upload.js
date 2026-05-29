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

// Export the configured multer middleware - UPDATED with icon and gallery fields
export const uploadServiceImages = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "icon", maxCount: 1 }, // Added icon field
  { name: "gallery", maxCount: 20 }, // Added gallery for multiple images
  { name: "problemsWeSolveImages", maxCount: 20 },
  { name: "ourApproachImages", maxCount: 20 },
  { name: "keyBenefitsImages", maxCount: 20 }
]);