import { asyncHandler } from "../../utils/async-handler.js";
import { getCurrentGoal, upsertCurrentGoal } from "./goals.service.js";

export const getGoal = asyncHandler(async (req, res) => {
  const goal = await getCurrentGoal(req.user.id);

  res.status(200).json({
    success: true,
    data: goal,
  });
});

export const upsertGoal = asyncHandler(async (req, res) => {
  const goal = await upsertCurrentGoal(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Goal saved successfully",
    data: goal,
  });
});
