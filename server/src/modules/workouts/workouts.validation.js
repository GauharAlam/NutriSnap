import { z } from "zod";
import { validate } from "../../utils/validate.js";

/* ─── Log Workout Schema ─── */
const logWorkoutSchema = z.object({
  title: z
    .string({ required_error: "Workout title is required" })
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be 100 characters or fewer"),
  category: z
    .string({ required_error: "Category is required" })
    .trim()
    .min(1, "Category is required"),
  durationMinutes: z
    .number({ required_error: "Duration is required" })
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 600 minutes"),
  caloriesBurned: z
    .number({ required_error: "Calories burned is required" })
    .int()
    .min(0, "Calories burned cannot be negative")
    .max(10000, "Calories burned seems too high"),
  totalSets: z
    .number()
    .int()
    .min(0)
    .max(500)
    .default(0),
});

export const validateLogWorkout = validate(logWorkoutSchema);
