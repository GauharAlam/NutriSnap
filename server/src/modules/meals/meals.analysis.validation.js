import { AppError } from "../../utils/app-error.js";

export function validateAnalyzeMealPayload(req, res, next) {
  const { imagePath, mealTypeHint, originalName } = req.body;
  const allowedMealTypes = ["breakfast", "lunch", "dinner", "snack"];

  if (!imagePath || typeof imagePath !== "string") {
    return next(new AppError("imagePath is required for analysis", 400));
  }

  if (mealTypeHint && !allowedMealTypes.includes(mealTypeHint)) {
    return next(new AppError("Meal type hint is invalid", 400));
  }

  if (originalName !== undefined && typeof originalName !== "string") {
    return next(new AppError("originalName must be a string", 400));
  }

  next();
}
