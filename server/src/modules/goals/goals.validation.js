import { AppError } from "../../utils/app-error.js";

const allowedGoalTypes = ["weight_loss", "muscle_gain", "maintenance", "recomp"];
const nutrientFields = ["calories", "protein", "carbs", "fats", "sugar"];

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function validateGoalPayload(req, res, next) {
  const { goalType, dailyTargets, currentWeight, targetWeight, weeklyWorkoutDays, notes } =
    req.body;

  if (goalType && !allowedGoalTypes.includes(goalType)) {
    return next(new AppError("Goal type is invalid", 400));
  }

  // Daily targets are now optional because the server can calculate them from profile
  if (dailyTargets) {
    if (typeof dailyTargets !== "object") {
      return next(new AppError("Daily targets must be an object", 400));
    }

    for (const field of nutrientFields) {
      if (dailyTargets[field] !== undefined) {
        if (!isFiniteNumber(dailyTargets[field]) || dailyTargets[field] < 0) {
          return next(new AppError(`Daily target for ${field} must be a valid number`, 400));
        }
      }
    }

    if (dailyTargets.calories && dailyTargets.calories < 1000) {
      return next(new AppError("Calories target must be at least 1000", 400));
    }
  }

  if (currentWeight !== null && currentWeight !== undefined) {
    if (!isFiniteNumber(currentWeight) || currentWeight <= 0) {
      return next(new AppError("Current weight must be a valid positive number", 400));
    }
  }

  if (targetWeight !== null && targetWeight !== undefined) {
    if (!isFiniteNumber(targetWeight) || targetWeight <= 0) {
      return next(new AppError("Target weight must be a valid positive number", 400));
    }
  }

  if (weeklyWorkoutDays !== undefined) {
    if (!isFiniteNumber(weeklyWorkoutDays) || weeklyWorkoutDays < 0 || weeklyWorkoutDays > 14) {
      return next(new AppError("Weekly workout days must be between 0 and 14", 400));
    }
  }

  if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
    return next(new AppError("Notes must be 500 characters or fewer", 400));
  }

  next();
}
