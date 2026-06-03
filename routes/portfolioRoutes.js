import express from "express";
import multer from "multer";

import {
  createPortfolioItem,
  getPortfolioItems,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
} from "../controllers/portfolioController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.get("/", getPortfolioItems);
router.get("/:id", getPortfolioItemById);

router.post(
  "/",
  upload.single("image"),
  createPortfolioItem
);

router.put(
  "/:id",
  upload.single("image"),
  updatePortfolioItem
);

router.delete("/:id", deletePortfolioItem);

export default router;