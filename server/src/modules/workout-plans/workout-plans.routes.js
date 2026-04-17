import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getAllWorkoutPlans, getWorkoutPlanBySlug } from "./workout-plans.controller.js";

const router = Router();

// Protect all routes
router.use(requireAuth);

router.get("/", getAllWorkoutPlans);
router.get("/:slug", getWorkoutPlanBySlug);

export default router;
