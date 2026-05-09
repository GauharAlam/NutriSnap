import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { mealImageUpload } from "../../middleware/upload.js";
import {
  analyzeMealImage,
  createMealEntry,
  deleteMealEntry,
  estimateMealNutrition,
  listMeals,
  updateMealEntry,
  uploadMealImage,
  getTemplates,
} from "./meals.controller.js";
import { validateAnalyzeMealPayload } from "./meals.analysis.validation.js";
import { validateEstimateNutritionPayload } from "./meals.estimate.validation.js";
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
router.post("/analyze-image", requireAuth, validateAnalyzeMealPayload, analyzeMealImage);
router.post(
  "/estimate-nutrition",
  requireAuth,
  validateEstimateNutritionPayload,
  estimateMealNutrition
);
router.post("/", requireAuth, validateCreateMealPayload, createMealEntry);
router.get("/", requireAuth, listMeals);
router.get("/templates", requireAuth, getTemplates);
router.patch("/:id", requireAuth, validateUpdateMealPayload, updateMealEntry);
router.delete("/:id", requireAuth, deleteMealEntry);

export default router;
