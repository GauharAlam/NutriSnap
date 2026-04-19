import { logger } from "../config/logger.js";
import * as Sentry from "@sentry/node";

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.name === "MulterError" ? 400 : 500);
  const message =
    err.message ||
    (err.name === "MulterError" ? "Upload failed because the file was invalid" : "Internal server error");

  // Log with Winston — errors get full stack, 4xx get warn level
  if (statusCode >= 500) {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }
    
    logger.error(message, {
      statusCode,
      method: req.method,
      url: req.originalUrl,
      stack: err.stack,
      userId: req.user?.id,
    });
  } else if (statusCode >= 400) {
    logger.warn(message, {
      statusCode,
      method: req.method,
      url: req.originalUrl,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
