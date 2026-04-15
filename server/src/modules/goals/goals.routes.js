import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getGoal, upsertGoal } from "./goals.controller.js";
import { validateGoalPayload } from "./goals.validation.js";

const router = Router();

router.get("/", requireAuth, getGoal);
router.put("/", requireAuth, validateGoalPayload, upsertGoal);

export default router;
