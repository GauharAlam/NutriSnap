import { Workout } from "../../models/workout.model.js";

/**
 * Log a completed workout session
 * POST /api/v1/workouts
 */
export async function logWorkout(req, res, next) {
  try {
    const { title, category, durationMinutes, caloriesBurned, totalSets } = req.body;

    if (!title || !category || !durationMinutes || !caloriesBurned) {
      return res.status(400).json({
        success: false,
        message: "Missing required workout fields",
      });
    }

    const workout = await Workout.create({
      userId: req.user.id,
      title,
      category,
      durationMinutes,
      caloriesBurned,
      totalSets: totalSets || 0,
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
 * Get workout history for the user
 * GET /api/v1/workouts
 */
export async function getWorkoutHistory(req, res, next) {
  try {
    const workouts = await Workout.find({ userId: req.user.id })
      .sort({ completedAt: -1 })
      .limit(30);

    // Calculate sum stats for the summary
    const stats = workouts.reduce(
      (acc, w) => {
        acc.totalWorkouts += 1;
        acc.totalDuration += w.durationMinutes;
        acc.totalCalories += w.caloriesBurned;
        acc.totalSets += w.totalSets;
        return acc;
      },
      { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, totalSets: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        workouts,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
}
