import express from "express";

import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.post(
  "/admin/create",
  createJob
);

router.get(
  "/admin",
  getJobs
);

router.put(
  "/admin/:id",
  updateJob
);

router.delete(
  "/admin/:id",
  deleteJob
);

export default router;