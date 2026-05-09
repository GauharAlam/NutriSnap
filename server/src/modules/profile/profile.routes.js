import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getProfile, updateProfile } from "./profile.controller.js";
import { validateProfilePayload } from "./profile.validation.js";

const router = Router();

router.get("/", requireAuth, getProfile);
router.patch("/", requireAuth, validateProfilePayload, updateProfile);

export default router;
