import { AppError } from "../../utils/app-error.js";

const allowedGoals = ["weight_loss", "muscle_gain", "maintenance"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegisterPayload(req, res, next) {
  const { name, email, password, goalType } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return next(new AppError("Name must be at least 2 characters", 400));
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return next(new AppError("A valid email is required", 400));
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  if (goalType && !allowedGoals.includes(goalType)) {
    return next(new AppError("Goal type is invalid", 400));
  }

  next();
}

export function validateLoginPayload(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return next(new AppError("A valid email is required", 400));
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  next();
}

export function validateRefreshPayload(req, res, next) {
  if (!req.cookies.refreshToken && !req.body.refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  next();
}
