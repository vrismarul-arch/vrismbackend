import express from "express";
import {
  createSnapshot,
  unlockSnapshot,
  getSnapshot,
  getAllSnapshots,
} from "../controllers/growthSnapshotController.js";

const router = express.Router();

router.post("/", createSnapshot);
router.patch("/:id/unlock", unlockSnapshot);
router.get("/:id", getSnapshot);
router.get("/", getAllSnapshots);

export default router;