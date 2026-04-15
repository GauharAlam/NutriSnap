import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { mealImageUpload } from "../../middleware/upload.js";
import {
  analyzeMealImage,
  createMealEntry,
  deleteMealEntry,
  listMeals,
  updateMealEntry,
  uploadMealImage,
} from "./meals.controller.js";
import {
  validateCreateMealPayload,
  validateUpdateMealPayload,
} from "./meals.validation.js";

const router = Router();

router.post(
  "/upload-image",
  requireAuth,
  mealImageUpload.single("image"),
  uploadMealImage
);
router.post("/analyze-image", requireAuth, analyzeMealImage);
router.post("/", requireAuth, validateCreateMealPayload, createMealEntry);
router.get("/", requireAuth, listMeals);
router.patch("/:id", requireAuth, validateUpdateMealPayload, updateMealEntry);
router.delete("/:id", requireAuth, deleteMealEntry);

export default router;
