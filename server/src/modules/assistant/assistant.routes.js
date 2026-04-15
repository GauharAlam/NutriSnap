import { Router } from "express";

const router = Router();

router.post("/chat", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI assistant placeholder",
  });
});

export default router;
