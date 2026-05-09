import { Goal } from "../../models/goal.model.js";
import { User } from "../../models/user.model.js";
import { AppError } from "../../utils/app-error.js";
import { computeTargetsFromProfile } from "../../services/nutrition/tdee-calculator.js";

/**
 * Static fallback presets — used when the user has no profile data for TDEE
 * calculation.  Once a profile is filled in, calculateMacroTargets() is
 * preferred.
 */
const goalPresets = {
  weight_loss: {
    calories: 1800,
    protein: 140,
    carbs: 160,
    fats: 60,
    sugar: 35,
  },
  muscle_gain: {
    calories: 2600,
    protein: 170,
    carbs: 300,
    fats: 75,
    sugar: 45,
  },
  maintenance: {
    calories: 2200,
    protein: 150,
    carbs: 220,
    fats: 70,
    sugar: 40,
  },
  recomp: {
    calories: 2200,
    protein: 175,
    carbs: 200,
    fats: 65,
    sugar: 35,
  },
};

function formatGoal(goal) {
  return {
    id: goal._id.toString(),
    goalType: goal.goalType,
    dailyTargets: goal.dailyTargets,
    currentWeight: goal.currentWeight,
    targetWeight: goal.targetWeight,
    weeklyWorkoutDays: goal.weeklyWorkoutDays,
    notes: goal.notes,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}

/**
 * Build smart defaults based on the user's profile.
 * If profile data (age, gender, height, weight) is available, use the
 * Mifflin-St Jeor TDEE calculation.  Otherwise fall back to static presets.
 */
function getSmartDefaults(goalType, profile) {
  const hasProfile = profile?.age && profile?.gender && profile?.heightCm && profile?.weightKg;

  if (hasProfile) {
    const { bmr, tdee, targets } = computeTargetsFromProfile({
      age: profile.age,
      gender: profile.gender,
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      activityLevel: profile.activityLevel || "moderate",
      trainingGoal: goalType,
    });

    return { dailyTargets: targets, bmr, tdee, source: "tdee" };
  }

  return {
    dailyTargets: goalPresets[goalType] || goalPresets.maintenance,
    bmr: null,
    tdee: null,
    source: "preset",
  };
}

function buildGoalDraft(goalType, profile) {
  const { dailyTargets, bmr, tdee, source } = getSmartDefaults(goalType, profile);

  return {
    id: null,
    goalType,
    dailyTargets,
    currentWeight: profile?.weightKg || null,
    targetWeight: null,
    weeklyWorkoutDays: 4,
    notes: "",
    createdAt: null,
    updatedAt: null,
    isDraft: true,
    bmr,
    tdee,
    targetSource: source,
  };
}

export async function getCurrentGoal(userId) {
  const user = await User.findById(userId).select("_id goalType profile");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const goal = await Goal.findOne({ userId: user._id });

  if (!goal) {
    return buildGoalDraft(user.goalType || "maintenance", user.profile);
  }

  return {
    ...formatGoal(goal),
    isDraft: false,
  };
}

export async function upsertCurrentGoal(userId, payload) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // If no custom dailyTargets provided, compute from profile
  let dailyTargets = payload.dailyTargets;
  if (!dailyTargets) {
    const defaults = getSmartDefaults(payload.goalType, user.profile);
    dailyTargets = defaults.dailyTargets;
  }

  const goal = await Goal.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        goalType: payload.goalType,
        dailyTargets,
        currentWeight: payload.currentWeight ?? user.profile?.weightKg ?? null,
        targetWeight: payload.targetWeight ?? null,
        weeklyWorkoutDays: payload.weeklyWorkoutDays,
        notes: payload.notes || "",
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  if (user.goalType !== payload.goalType) {
    user.goalType = payload.goalType;
    await user.save();
  }

  return {
    ...formatGoal(goal),
    isDraft: false,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      goalType: user.goalType,
      createdAt: user.createdAt,
    },
  };
}

/**
 * Recalculate the user's goal targets based on their current profile.
 * Called when the user updates their profile (age, weight, activity level, etc.)
 */
export async function recalculateGoalFromProfile(userId) {
  const user = await User.findById(userId).select("_id goalType profile");
  if (!user) return null;

  const goal = await Goal.findOne({ userId: user._id });
  if (!goal) return null; // no goal to recalculate

  const { dailyTargets } = getSmartDefaults(goal.goalType, user.profile);

  goal.dailyTargets = dailyTargets;
  if (user.profile?.weightKg) {
    goal.currentWeight = user.profile.weightKg;
  }
  await goal.save();

  return formatGoal(goal);
}
