import { Workout } from "../../models/workout.model.js";
import { paginate } from "../../utils/paginate.js";
import { updateActivityStreak } from "../../utils/streak-updater.js";
import { detectAndFlagPRs, getUserPRs } from "../../services/workout/pr-tracker.service.js";
import {
  getWeeklyWorkoutSummary,
  getStrengthTrend,
} from "../../services/workout/volume-analytics.service.js";
import { AppError } from "../../utils/app-error.js";

/**
 * Log a completed workout session
 * POST /api/v1/workouts
 */
export async function logWorkout(req, res, next) {
  try {
    // Auto-calculate totalSets from exercises if provided
    let totalSets = req.body.totalSets || 0;
    if (req.body.exercises && req.body.exercises.length > 0 && totalSets === 0) {
      totalSets = req.body.exercises.reduce(
        (sum, ex) => sum + (ex.sets ? ex.sets.length : 0),
        0
      );
    }

    const workout = await Workout.create({
      userId: req.user.id,
      ...req.body,
      totalSets,
    });

    // Detect and flag Personal Records
    let prs = [];
    if (workout.exercises && workout.exercises.length > 0) {
      const prResult = await detectAndFlagPRs(workout);
      prs = prResult.prs;
    }

    // Gamification Streak update
    await updateActivityStreak(req.user.id);

    res.status(201).json({
      success: true,
      data: workout,
      prs, // return detected PRs so the client can celebrate 🎉
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single workout by ID
 * GET /api/v1/workouts/:id
 */
export async function getWorkoutById(req, res, next) {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workout) {
      throw new AppError("Workout not found", 404);
    }

    res.status(200).json({
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

/**
 * Delete a workout
 * DELETE /api/v1/workouts/:id
 */
export async function deleteWorkout(req, res, next) {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workout) {
      throw new AppError("Workout not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Workout deleted successfully",
      data: workout,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get workout analytics (volume, PRs, trends)
 * GET /api/v1/workouts/analytics?weekStart=2026-05-05&exercise=Bench+Press&weeks=8
 */
export async function getWorkoutAnalytics(req, res, next) {
  try {
    // Default weekStart to current Monday
    let weekStart = req.query.weekStart;
    if (!weekStart) {
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      weekStart = monday.toISOString().split("T")[0];
    }

    const [summary, prs] = await Promise.all([
      getWeeklyWorkoutSummary(req.user.id, weekStart),
      getUserPRs(req.user.id),
    ]);

    // Optional: strength trend for a specific exercise
    let strengthTrend = null;
    if (req.query.exercise) {
      strengthTrend = await getStrengthTrend(
        req.user.id,
        req.query.exercise,
        parseInt(req.query.weeks) || 8
      );
    }

    res.status(200).json({
      success: true,
      data: {
        weeklySummary: summary,
        personalRecords: prs,
        strengthTrend,
      },
    });
  } catch (error) {
    next(error);
  }
}
