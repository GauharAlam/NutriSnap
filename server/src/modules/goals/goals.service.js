import { Goal } from "../../models/goal.model.js";
import { User } from "../../models/user.model.js";
import { AppError } from "../../utils/app-error.js";

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

function buildGoalDraft(goalType) {
  return {
    id: null,
    goalType,
    dailyTargets: goalPresets[goalType],
    currentWeight: null,
    targetWeight: null,
    weeklyWorkoutDays: 4,
    notes: "",
    createdAt: null,
    updatedAt: null,
    isDraft: true,
  };
}

export async function getCurrentGoal(userId) {
  const user = await User.findById(userId).select("_id goalType");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const goal = await Goal.findOne({ userId: user._id });

  if (!goal) {
    return buildGoalDraft(user.goalType || "maintenance");
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

  const goal = await Goal.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        goalType: payload.goalType,
        dailyTargets: payload.dailyTargets,
        currentWeight: payload.currentWeight ?? null,
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
