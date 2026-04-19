import { AppError } from "../utils/app-error.js";

/**
 * Sanitize request inputs to prevent NoSQL injection.
 * Strips any keys starting with "$" from req.body, req.query, req.params.
 */
function sanitizeObject(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block NoSQL operators ($gt, $lt, $ne, $regex, etc.)
    if (key.startsWith("$")) {
      continue; // silently strip
    }
    sanitized[key] = typeof value === "object" ? sanitizeObject(value) : value;
  }
  return sanitized;
}

export function sanitizeInputs(req, res, next) {
  try {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    next();
  } catch (err) {
    next(new AppError("Invalid input data", 400));
  }
}
