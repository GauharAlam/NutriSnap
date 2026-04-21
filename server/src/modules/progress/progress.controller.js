import path from "path";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getDailyDashboard, getWeeklyDashboard } from "./progress.service.js";
import { ProgressPhoto } from "../../models/progress-photo.model.js";
import { AppError } from "../../utils/app-error.js";

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

export const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Photo is required", 400);
  }

  const { weight } = req.body;
  const imagePath = `/uploads/progress/${path.basename(req.file.path)}`;
  const imageUrl = `${env.serverUrl}${imagePath}`;
  const dateStr = new Date().toISOString().split('T')[0];

  const photo = await ProgressPhoto.create({
    userId: req.user.id,
    date: req.body.date || dateStr,
    weight: weight ? parseFloat(weight) : null,
    imagePath,
    imageUrl,
  });

  res.status(201).json({
    success: true,
    message: "Progress photo uploaded",
    data: photo,
  });
});

export const getPhotos = asyncHandler(async (req, res) => {
  const photos = await ProgressPhoto.find({ userId: req.user.id }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: photos,
  });
});
