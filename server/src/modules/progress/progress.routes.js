import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getDailyProgress, getWeeklyProgress } from "./progress.controller.js";

const router = Router();

router.get("/daily", requireAuth, getDailyProgress);
router.get("/weekly", requireAuth, getWeeklyProgress);

export default router;
