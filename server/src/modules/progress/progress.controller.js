import { asyncHandler } from "../../utils/async-handler.js";
import { getDailyDashboard, getWeeklyDashboard } from "./progress.service.js";

export const getDailyProgress = asyncHandler(async (req, res) => {
  const data = await getDailyDashboard(req.user.id, req.query.date);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getWeeklyProgress = asyncHandler(async (req, res) => {
  const data = await getWeeklyDashboard(req.user.id, req.query.weekStart);

  res.status(200).json({
    success: true,
    data,
  });
});
