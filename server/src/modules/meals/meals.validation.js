import { AppError } from "../../utils/app-error.js";

const allowedMealTypes = ["breakfast", "lunch", "dinner", "snack"];
const allowedSources = ["manual", "image_upload", "ai_estimated"];
const nutrientFields = ["calories", "protein", "carbs", "fats", "sugar"];

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validateNutrition(nutrition) {
  if (!nutrition || typeof nutrition !== "object") {
    throw new AppError("Nutrition values are required", 400);
  }

  for (const field of nutrientFields) {
    if (!isFiniteNumber(nutrition[field]) || nutrition[field] < 0) {
      throw new AppError(`Nutrition value for ${field} must be a valid number`, 400);
    }
  }
}

function validateFoodItems(foodItems) {
  if (foodItems === undefined) {
    return;
  }

  if (!Array.isArray(foodItems)) {
    throw new AppError("Food items must be an array of strings", 400);
  }

  for (const item of foodItems) {
    if (typeof item !== "string") {
      throw new AppError("Food items must be strings", 400);
    }
  }
}

export function validateCreateMealPayload(req, res, next) {
  try {
    const { title, mealType, foodItems, notes, eatenAt, imageUrl, imagePath, nutrition, source } =
      req.body;

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      throw new AppError("Meal title must be at least 2 characters", 400);
    }

    if (!allowedMealTypes.includes(mealType)) {
      throw new AppError("Meal type is invalid", 400);
    }

    validateFoodItems(foodItems);

    if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
      throw new AppError("Notes must be 500 characters or fewer", 400);
    }

    if (!eatenAt || !isValidDate(eatenAt)) {
      throw new AppError("A valid eatenAt timestamp is required", 400);
    }

    if (imageUrl !== undefined && typeof imageUrl !== "string") {
      throw new AppError("Image URL must be a string", 400);
    }

    if (imagePath !== undefined && typeof imagePath !== "string") {
      throw new AppError("Image path must be a string", 400);
    }

    if (source !== undefined && !allowedSources.includes(source)) {
      throw new AppError("Meal source is invalid", 400);
    }

    validateNutrition(nutrition);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdateMealPayload(req, res, next) {
  try {
    const { title, mealType, foodItems, notes, eatenAt, imageUrl, imagePath, nutrition, source } =
      req.body;

    if (title !== undefined && (typeof title !== "string" || title.trim().length < 2)) {
      throw new AppError("Meal title must be at least 2 characters", 400);
    }

    if (mealType !== undefined && !allowedMealTypes.includes(mealType)) {
      throw new AppError("Meal type is invalid", 400);
    }

    validateFoodItems(foodItems);

    if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
      throw new AppError("Notes must be 500 characters or fewer", 400);
    }

    if (eatenAt !== undefined && !isValidDate(eatenAt)) {
      throw new AppError("eatenAt must be a valid timestamp", 400);
    }

    if (imageUrl !== undefined && typeof imageUrl !== "string") {
      throw new AppError("Image URL must be a string", 400);
    }

    if (imagePath !== undefined && typeof imagePath !== "string") {
      throw new AppError("Image path must be a string", 400);
    }

    if (source !== undefined && !allowedSources.includes(source)) {
      throw new AppError("Meal source is invalid", 400);
    }

    if (nutrition !== undefined) {
      validateNutrition(nutrition);
    }

    next();
  } catch (error) {
    next(error);
  }
}
