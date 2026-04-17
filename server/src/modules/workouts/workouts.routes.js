import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { logWorkout, getWorkoutHistory } from "./workouts.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", logWorkout);
router.get("/", getWorkoutHistory);

export default router;
