import { Router } from "express";

const router = Router();

router.get("/daily", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Daily dashboard placeholder",
  });
});

router.get("/weekly", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Weekly dashboard placeholder",
  });
});

export default router;
