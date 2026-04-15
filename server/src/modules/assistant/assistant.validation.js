import { AppError } from "../../utils/app-error.js";

export function validateAssistantPayload(req, res, next) {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length < 3) {
    return next(new AppError("Assistant message must be at least 3 characters", 400));
  }

  next();
}
