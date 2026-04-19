import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { logWorkout, getWorkoutHistory } from "./workouts.controller.js";
import { validateLogWorkout } from "./workouts.validation.js";

const router = Router();

router.use(requireAuth);

router.post("/", validateLogWorkout, logWorkout);
router.get("/", getWorkoutHistory);

export default router;
