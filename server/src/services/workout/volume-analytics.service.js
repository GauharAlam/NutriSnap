import { Workout } from "../../models/workout.model.js";

/**
 * Volume Analytics Service
 *
 * Provides muscle-group-level training volume analysis, strength trends,
 * and gap detection for gym users.
 */

/**
 * Compute total working sets per muscle group for a given week.
 *
 * @param {string} userId
 * @param {string} weekStartStr - YYYY-MM-DD of Monday
 * @returns {Promise<Record<string, number>>} e.g. { chest: 12, back: 15, ... }
 */
export async function getWeeklyVolumeByMuscle(userId, weekStartStr) {
  const start = new Date(`${weekStartStr}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const workouts = await Workout.find({
    userId,
    completedAt: { $gte: start, $lte: end },
    "exercises.0": { $exists: true }, // only workouts with exercise data
  })
    .select("exercises")
    .lean();

  const volumeByMuscle = {
    chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0,
    quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0,
    forearms: 0, traps: 0
  };

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const workingSets = exercise.sets.filter((s) => !s.isWarmup).length;

      for (const muscle of exercise.muscleGroups) {
        const key = muscle.toLowerCase();
        if (key in volumeByMuscle) {
          volumeByMuscle[key] += workingSets;
        } else {
          volumeByMuscle[key] = (volumeByMuscle[key] || 0) + workingSets;
        }
      }
    }
  }

  return volumeByMuscle;
}

/**
 * Get strength trend for a specific exercise over N weeks.
 * Returns the max weight used per week.
 *
 * @param {string} userId
 * @param {string} exerciseName
 * @param {number} weeks - how many weeks back to look (default 8)
 * @returns {Promise<Array<{ weekStart: string, maxWeight: number, totalVolume: number }>>}
 */
export async function getStrengthTrend(userId, exerciseName, weeks = 8) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeks * 7);

  const workouts = await Workout.find({
    userId,
    completedAt: { $gte: startDate },
    "exercises.exerciseName": exerciseName,
  })
    .select("exercises completedAt")
    .sort({ completedAt: 1 })
    .lean();

  // Group by ISO week
  const weekMap = new Map();

  for (const workout of workouts) {
    const date = new Date(workout.completedAt);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    const weekKey = monday.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { maxWeight: 0, totalVolume: 0 });
    }

    const entry = weekMap.get(weekKey);

    for (const exercise of workout.exercises) {
      if (exercise.exerciseName !== exerciseName) continue;

      for (const set of exercise.sets) {
        if (set.isWarmup) continue;
        if ((set.weightKg || 0) > entry.maxWeight) {
          entry.maxWeight = set.weightKg;
        }
        entry.totalVolume += (set.weightKg || 0) * (set.reps || 0);
      }
    }
  }

  return Array.from(weekMap.entries()).map(([weekStart, data]) => ({
    weekStart,
    maxWeight: data.maxWeight,
    totalVolume: Math.round(data.totalVolume),
  }));
}

/**
 * Detect muscle groups that haven't been trained in the current week.
 *
 * @param {string} userId
 * @param {string} weekStartStr - YYYY-MM-DD
 * @returns {Promise<string[]>} list of missed muscle groups
 */
export async function getMissedMuscleGroups(userId, weekStartStr) {
  const allMuscleGroups = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "quads",
    "hamstrings",
    "glutes",
    "calves",
    "core",
    "forearms",
    "traps",
  ];

  const volumeByMuscle = await getWeeklyVolumeByMuscle(userId, weekStartStr);
  const trainedMuscles = new Set(
    Object.keys(volumeByMuscle).filter((m) => volumeByMuscle[m] > 0)
  );

  return allMuscleGroups.filter((m) => !trainedMuscles.has(m));
}

/**
 * Get a comprehensive weekly workout summary.
 *
 * @param {string} userId
 * @param {string} weekStartStr
 * @returns {Promise<object>}
 */
export async function getWeeklyWorkoutSummary(userId, weekStartStr) {
  const [volumeByMuscle, missedMuscles] = await Promise.all([
    getWeeklyVolumeByMuscle(userId, weekStartStr),
    getMissedMuscleGroups(userId, weekStartStr),
  ]);

  const start = new Date(`${weekStartStr}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const workoutCount = await Workout.countDocuments({
    userId,
    completedAt: { $gte: start, $lte: end },
  });

  const totalSets = Object.values(volumeByMuscle).reduce((a, b) => a + b, 0);

  return {
    weekStart: weekStartStr,
    workoutCount,
    totalWorkingSets: totalSets,
    volumeByMuscle,
    missedMuscleGroups: missedMuscles,
    recommendations: generateVolumeRecommendations(volumeByMuscle, missedMuscles),
  };
}

/**
 * Generate training recommendations based on volume data.
 */
function generateVolumeRecommendations(volumeByMuscle, missedMuscles) {
  const recommendations = [];

  // Flag under-trained muscles (< 10 sets/week is sub-optimal for hypertrophy)
  for (const [muscle, sets] of Object.entries(volumeByMuscle)) {
    if (sets < 10) {
      recommendations.push(
        `${muscle} has only ${sets} sets this week. Aim for 10-20 sets/week for optimal growth.`
      );
    } else if (sets > 20) {
      recommendations.push(
        `${muscle} has ${sets} sets this week. Over 20 sets/week may impair recovery. Consider deloading.`
      );
    }
  }

  if (missedMuscles.length > 0) {
    recommendations.push(
      `Missed muscle groups this week: ${missedMuscles.join(", ")}. Add exercises for balanced development.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Great balance! Your volume distribution looks solid this week.");
  }

  return recommendations;
}
