import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { chatWithAssistant } from "./assistant.controller.js";
import { validateAssistantPayload } from "./assistant.validation.js";

const router = Router();

router.post("/chat", requireAuth, validateAssistantPayload, chatWithAssistant);

export default router;
