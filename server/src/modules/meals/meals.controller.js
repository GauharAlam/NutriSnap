import path from "path";
import { env } from "../../config/env.js";
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
  res.status(501).json({
    success: false,
    message: "AI meal analysis will be added in the next phase",
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
