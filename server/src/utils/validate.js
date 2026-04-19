import { z } from "zod";
import { AppError } from "./app-error.js";

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {import("express").RequestHandler}
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      const message = `${firstError.path.join(".")}: ${firstError.message}`.replace(/^: /, "");
      return next(new AppError(message, 400));
    }
    // Replace body with parsed (coerced/transformed) values
    req.body = result.data;
    next();
  };
}

/**
 * Creates an Express middleware that validates req.query against a Zod schema.
 * @param {z.ZodSchema} schema
 * @returns {import("express").RequestHandler}
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const firstError = result.error.issues[0];
      const message = `${firstError.path.join(".")}: ${firstError.message}`.replace(/^: /, "");
      return next(new AppError(message, 400));
    }
    req.query = result.data;
    next();
  };
}
