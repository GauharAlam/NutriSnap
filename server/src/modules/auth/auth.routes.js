import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { login, logout, me, refresh, register, updatePushToken } from "./auth.controller.js";
import {
  validateLoginPayload,
  validateRefreshPayload,
  validateRegisterPayload,
} from "./auth.validation.js";

const router = Router();

router.post("/register", validateRegisterPayload, register);
router.post("/login", validateLoginPayload, login);
router.post("/refresh", validateRefreshPayload, refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.put("/push-token", requireAuth, updatePushToken);

export default router;
