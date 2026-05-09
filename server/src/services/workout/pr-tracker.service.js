import { Workout } from "../../models/workout.model.js";

/**
 * PR Tracker Service
 *
 * After a workout is saved, checks each exercise's sets against the user's
 * historical best.  A PR is any set where (weightKg × reps) exceeds all
 * previous working sets (non-warmup) for that exercise.
 */

/**
 * Find the user's all-time best "volume load" (weight × reps) for a given
 * exercise, excluding warmup sets.
 *
 * @param {string} userId
 * @param {string} exerciseName - denormalized name
 * @returns {Promise<number>} best volume load, or 0 if no history
 */
async function getBestVolumeLoad(userId, exerciseName) {
  const workouts = await Workout.find({
    userId,
    "exercises.exerciseName": exerciseName,
  })
    .select("exercises")
    .lean();

  let best = 0;

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (exercise.exerciseName !== exerciseName) continue;

      for (const set of exercise.sets) {
        if (set.isWarmup) continue;
        const volume = (set.weightKg || 0) * (set.reps || 0);
        if (volume > best) best = volume;
      }
    }
  }

  return best;
}

/**
 * Find the user's all-time max weight for a given exercise.
 *
 * @param {string} userId
 * @param {string} exerciseName
 * @returns {Promise<number>} max weight in kg, or 0
 */
async function getMaxWeight(userId, exerciseName) {
  const workouts = await Workout.find({
    userId,
    "exercises.exerciseName": exerciseName,
  })
    .select("exercises")
    .lean();

  let max = 0;

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (exercise.exerciseName !== exerciseName) continue;

      for (const set of exercise.sets) {
        if (set.isWarmup) continue;
        if ((set.weightKg || 0) > max) max = set.weightKg;
      }
    }
  }

  return max;
}

/**
 * Process a newly saved workout: detect and flag PRs on qualifying sets.
 *
 * A set is a PR if:
 * 1. It's not a warmup set
 * 2. Its (weight × reps) exceeds the previous best volume load, OR
 * 3. Its weight exceeds the previous max weight for that exercise
 *
 * @param {import('mongoose').Document} workout - the saved workout document
 * @returns {Promise<{ prs: Array<{ exerciseName: string, setNumber: number, type: string, value: number }> }>}
 */
export async function detectAndFlagPRs(workout) {
  const prs = [];
  let modified = false;

  for (const exercise of workout.exercises) {
    // Get historical bests BEFORE this workout (exclude current workout by id)
    const previousWorkouts = await Workout.find({
      userId: workout.userId,
      _id: { $ne: workout._id },
      "exercises.exerciseName": exercise.exerciseName,
    })
      .select("exercises")
      .lean();

    let bestVolume = 0;
    let bestWeight = 0;

    for (const pw of previousWorkouts) {
      for (const pe of pw.exercises) {
        if (pe.exerciseName !== exercise.exerciseName) continue;
        for (const s of pe.sets) {
          if (s.isWarmup) continue;
          const vol = (s.weightKg || 0) * (s.reps || 0);
          if (vol > bestVolume) bestVolume = vol;
          if ((s.weightKg || 0) > bestWeight) bestWeight = s.weightKg;
        }
      }
    }

    for (const set of exercise.sets) {
      if (set.isWarmup) continue;

      const currentVolume = (set.weightKg || 0) * (set.reps || 0);
      const isVolumePR = currentVolume > bestVolume && bestVolume > 0;
      const isWeightPR = (set.weightKg || 0) > bestWeight && bestWeight > 0;

      if (isVolumePR || isWeightPR) {
        set.isPR = true;
        modified = true;
        prs.push({
          exerciseName: exercise.exerciseName,
          setNumber: set.setNumber,
          type: isWeightPR ? "weight" : "volume",
          value: isWeightPR ? set.weightKg : currentVolume,
        });

        // Update bestVolume/bestWeight to the current set so subsequent sets
        // in the same exercise only get flagged if they beat this one too.
        if (currentVolume > bestVolume) bestVolume = currentVolume;
        if ((set.weightKg || 0) > bestWeight) bestWeight = set.weightKg;
      }
    }
  }

  if (modified) {
    await workout.save();
  }

  return { prs };
}

/**
 * Get all PRs for a user, grouped by exercise.
 *
 * @param {string} userId
 * @returns {Promise<Array<{ exerciseName: string, bestWeight: number, bestVolume: number, date: Date }>>}
 */
export async function getUserPRs(userId) {
  const workouts = await Workout.find({
    userId,
    "exercises.sets.isPR": true,
  })
    .select("exercises completedAt")
    .sort({ completedAt: -1 })
    .lean();

  const prMap = new Map();

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        if (!set.isPR) continue;

        const key = exercise.exerciseName;
        const existing = prMap.get(key);
        const volume = (set.weightKg || 0) * (set.reps || 0);

        if (!existing || set.weightKg > existing.bestWeight || volume > existing.bestVolume) {
          prMap.set(key, {
            exerciseName: key,
            bestWeight: Math.max(set.weightKg || 0, existing?.bestWeight || 0),
            bestVolume: Math.max(volume, existing?.bestVolume || 0),
            date: workout.completedAt,
          });
        }
      }
    }
  }

  return Array.from(prMap.values());
}
