import { User } from "../../models/user.model.js";
import { AppError } from "../../utils/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { recalculateGoalFromProfile } from "../goals/goals.service.js";
import { computeTargetsFromProfile } from "../../services/nutrition/tdee-calculator.js";

/**
 * GET /api/v1/profile
 * Returns the current user's full profile including TDEE calculations.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const profile = user.profile || {};
  let tdeeInfo = null;

  // Compute TDEE if we have enough profile data
  if (profile.age && profile.gender && profile.heightCm && profile.weightKg) {
    tdeeInfo = computeTargetsFromProfile({
      age: profile.age,
      gender: profile.gender,
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      activityLevel: profile.activityLevel || "moderate",
      trainingGoal: profile.trainingGoal || user.goalType || "maintenance",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      goalType: user.goalType,
      profile,
      streaks: {
        current: user.currentStreak,
        longest: user.longestStreak,
        lastActive: user.lastActiveDate,
      },
      tdee: tdeeInfo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

/**
 * PATCH /api/v1/profile
 * Updates the user's profile and optionally recalculates goal targets.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Merge the incoming profile fields with existing profile
  const existingProfile = user.profile || {};
  const updatedFields = req.body;

  const mergedProfile = {
    ...existingProfile.toObject ? existingProfile.toObject() : existingProfile,
    ...updatedFields,
  };

  user.profile = mergedProfile;

  // Sync goalType if trainingGoal was updated
  if (updatedFields.trainingGoal) {
    user.goalType = updatedFields.trainingGoal;
  }

  await user.save();

  // Recalculate goal targets based on updated profile
  const recalculatedGoal = await recalculateGoalFromProfile(user._id);

  // Compute fresh TDEE info
  let tdeeInfo = null;
  const p = user.profile;
  if (p?.age && p?.gender && p?.heightCm && p?.weightKg) {
    tdeeInfo = computeTargetsFromProfile({
      age: p.age,
      gender: p.gender,
      weightKg: p.weightKg,
      heightCm: p.heightCm,
      activityLevel: p.activityLevel || "moderate",
      trainingGoal: p.trainingGoal || user.goalType || "maintenance",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      profile: user.profile,
      goalType: user.goalType,
      tdee: tdeeInfo,
      recalculatedGoal,
    },
  });
});
