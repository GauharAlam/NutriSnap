import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listExercises,
  createExercise,
  deleteExercise,
} from "./exercises.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", listExercises);
router.post("/", createExercise);
router.delete("/:id", deleteExercise);

export default router;
