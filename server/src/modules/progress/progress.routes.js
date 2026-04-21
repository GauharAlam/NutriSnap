import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { progressPhotoUpload } from "../../middleware/upload.js";
import {
  getDailyProgress,
  getWeeklyProgress,
  getPhotos,
  uploadPhoto,
} from "./progress.controller.js";

const router = Router();

router.get("/daily", requireAuth, getDailyProgress);
router.get("/weekly", requireAuth, getWeeklyProgress);

// Progress Photos
router.get("/photos", requireAuth, getPhotos);
router.post("/photos", requireAuth, progressPhotoUpload.single("image"), uploadPhoto);

export default router;
