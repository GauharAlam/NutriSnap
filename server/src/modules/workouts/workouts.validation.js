import { z } from "zod";
import { validate } from "../../utils/validate.js";

/* ─── Set Schema ─── */
const setSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).max(1000),
  weightKg: z.number().min(0).max(1000).default(0),
  rpe: z.number().min(1).max(10).optional().nullable(),
  restSeconds: z.number().int().min(0).max(600).default(60),
  isWarmup: z.boolean().default(false),
});

/* ─── Exercise Log Schema ─── */
const exerciseLogSchema = z.object({
  exerciseId: z.string().optional().nullable(),
  exerciseName: z
    .string({ required_error: "Exercise name is required" })
    .trim()
    .min(1, "Exercise name is required")
    .max(100),
  muscleGroups: z.array(z.string().trim()).default([]),
  sets: z.array(setSchema).default([]),
});

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
  exercises: z.array(exerciseLogSchema).default([]),
  notes: z.string().trim().max(500).default(""),
  workoutPlanId: z.string().optional().nullable(),
});

export const validateLogWorkout = validate(logWorkoutSchema);
