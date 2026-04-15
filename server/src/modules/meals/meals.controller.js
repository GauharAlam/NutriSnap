import path from "path";
import { env } from "../../config/env.js";
import { analyzeMealImageWithAi } from "../../services/ai/meal-analysis.service.js";
import { estimateNutritionFromItems } from "../../services/nutrition/meal-estimator.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import {
  createMeal,
  deleteMeal,
  listMealsForDate,
  updateMeal,
} from "./meals.service.js";

export const uploadMealImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Meal image is required", 400);
  }

  const imagePath = `/uploads/meals/${path.basename(req.file.path)}`;
  const imageUrl = `${env.serverUrl}${imagePath}`;

  res.status(201).json({
    success: true,
    message: "Meal image uploaded",
    data: {
      imageUrl,
      imagePath,
      originalName: req.file.originalname,
    },
  });
});

export const analyzeMealImage = asyncHandler(async (req, res) => {
  const result = await analyzeMealImageWithAi({
    imagePath: req.body.imagePath,
    imageUrl: req.body.imageUrl,
    originalName: req.body.originalName,
    mealTypeHint: req.body.mealTypeHint,
  });

  res.status(200).json({
    success: true,
    message: "Meal image analyzed",
    data: result,
  });
});

export const estimateMealNutrition = asyncHandler(async (req, res) => {
  const nutritionEstimate = estimateNutritionFromItems(req.body.foodItems);

  res.status(200).json({
    success: true,
    message: "Nutrition estimated successfully",
    data: nutritionEstimate,
  });
});

export const createMealEntry = asyncHandler(async (req, res) => {
  const meal = await createMeal(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Meal logged successfully",
    data: meal,
  });
});

export const listMeals = asyncHandler(async (req, res) => {
  const data = await listMealsForDate(req.user.id, req.query.date);

  res.status(200).json({
    success: true,
    data,
  });
});

export const updateMealEntry = asyncHandler(async (req, res) => {
  const meal = await updateMeal(req.user.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Meal updated successfully",
    data: meal,
  });
});

export const deleteMealEntry = asyncHandler(async (req, res) => {
  const deletedMeal = await deleteMeal(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Meal deleted successfully",
    data: deletedMeal,
  });
});
