import { Workout } from "../../models/workout.model.js";
import { paginate } from "../../utils/paginate.js";

/**
 * Log a completed workout session
 * POST /api/v1/workouts
 */
export async function logWorkout(req, res, next) {
  try {
    // req.body is already validated & coerced by Zod middleware
    const workout = await Workout.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get workout history for the user (paginated)
 * GET /api/v1/workouts?page=1&limit=20
 */
export async function getWorkoutHistory(req, res, next) {
  try {
    const { page, limit } = req.query;

    const { docs: workouts, pagination } = await paginate(
      Workout,
      { userId: req.user.id },
      { page, limit, sort: { completedAt: -1 } }
    );

    // Aggregate stats across ALL user workouts (not just current page)
    const [stats] = await Workout.aggregate([
      { $match: { userId: req.user._id || req.user.id } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: "$durationMinutes" },
          totalCalories: { $sum: "$caloriesBurned" },
          totalSets: { $sum: "$totalSets" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        workouts,
        stats: stats || { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, totalSets: 0 },
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}

