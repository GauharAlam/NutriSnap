import { Exercise } from "../../models/exercise.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";

/**
 * GET /api/v1/exercises?search=bench&category=Chest&equipment=barbell
 * List exercises — global + user's custom ones.
 */
export const listExercises = asyncHandler(async (req, res) => {
  const { search, category, equipment } = req.query;

  const filter = {
    $or: [
      { isCustom: false },           // global exercises
      { userId: req.user.id },       // user's custom exercises
    ],
  };

  if (category) filter.category = category;
  if (equipment) filter.equipment = equipment;
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const exercises = await Exercise.find(filter)
    .sort({ name: 1 })
    .limit(100)
    .lean();

  res.status(200).json({
    success: true,
    data: exercises,
    count: exercises.length,
  });
});

/**
 * POST /api/v1/exercises
 * Create a custom exercise.
 */
export const createExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.create({
    ...req.body,
    isCustom: true,
    userId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Custom exercise created",
    data: exercise,
  });
});

/**
 * DELETE /api/v1/exercises/:id
 * Delete a user's custom exercise only.
 */
export const deleteExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
    isCustom: true,
  });

  if (!exercise) {
    throw new AppError("Custom exercise not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Exercise deleted",
    data: exercise,
  });
});
