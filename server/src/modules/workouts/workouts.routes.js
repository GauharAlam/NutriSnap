import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  logWorkout,
  getWorkoutHistory,
  getWorkoutById,
  deleteWorkout,
  getWorkoutAnalytics,
} from "./workouts.controller.js";
import { validateLogWorkout } from "./workouts.validation.js";

const router = Router();

router.use(requireAuth);

// Analytics must be before /:id to avoid matching "analytics" as an id
router.get("/analytics", getWorkoutAnalytics);

router.post("/", validateLogWorkout, logWorkout);
router.get("/", getWorkoutHistory);
router.get("/:id", getWorkoutById);
router.delete("/:id", deleteWorkout);

export default router;
