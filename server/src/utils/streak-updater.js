import { User } from '../models/user.model.js';

/**
 * Updates a user's streak. Should be called whenever a meaningful
 * daily action is performed (logging a meal, finishing a workout).
 */
export const updateActivityStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    
    // If they already did something today, the streak doesn't increase again today
    if (user.lastActiveDate === todayStr) {
      return user;
    }

    // Check if they were active yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (user.lastActiveDate === yesterdayStr) {
      // Continuation of streak
      user.currentStreak += 1;
    } else {
      // Streak broken (or first time)
      user.currentStreak = 1;
    }

    // Update longest
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    user.lastActiveDate = todayStr;
    await user.save();
    return user;

  } catch (error) {
    console.error('Streak update failed:', error);
    return null;
  }
};
