import cron from 'node-cron';
import { User } from '../models/user.model.js';
import { Workout } from '../models/workout.model.js';
import { sendPushNotification } from '../services/notification.service.js';
import { getAssistantAdvice } from '../services/ai/diet-assistant.service.js';
import { getDailyDashboard } from '../modules/progress/progress.service.js';
import { logger } from '../config/logger.js';

/**
 * Sweeps through users with expoPushTokens, generates a daily customized push 
 * notification using Gemini based on their progress, and sends it.
 */
export const runDailyCoachJob = async () => {
  logger.info('Starting daily AI coach notification sweep...');

  try {
    const activeUsers = await User.find({ expoPushToken: { $ne: null } });
    if (activeUsers.length === 0) {
      logger.info('No users with push tokens found. Skipping daily coach.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const user of activeUsers) {
      try {
        // Fetch recent context for this user
        const lastWorkout = await Workout.findOne({ userId: user._id }).sort({ completedAt: -1 });

        // Build a prompt summarizing their current status
        const daysSinceLastWorkout = lastWorkout
          ? Math.floor((new Date() - new Date(lastWorkout.completedAt)) / (1000 * 60 * 60 * 24))
          : null;

        // Fetch yesterday's nutrition progress
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        const yesterdayProgress = await getDailyDashboard(user._id, yesterdayStr);
        const calEaten = yesterdayProgress?.summary?.calories || 0;
        
        let systemPrompt = `You are a personalized AI Fitness Coach for ${user.name}. Generate a SINGLE, short push notification message (max 150 characters). Be highly motivational. Context:\n`;
        
        if (daysSinceLastWorkout === 0 || daysSinceLastWorkout === 1) {
          systemPrompt += `- They worked out very recently! Praise them.\n`;
        } else if (daysSinceLastWorkout > 1) {
          systemPrompt += `- It has been ${daysSinceLastWorkout} days since their last workout. Motivate them to get back to it.\n`;
        } else {
          systemPrompt += `- They haven't logged any workouts yet. Remind them to start.\n`;
        }

        systemPrompt += `\nOutput ONLY the plain text notification body. No quotes, no intro, no emojis unless they fit naturally. Keep it punchy.`;

        // We use getAssistantAdvice, injecting our prompt as the message
        const responseData = await getAssistantAdvice(user._id, systemPrompt);
        const notificationText = responseData?.reply;

        // Send push
        if (notificationText) {
          await sendPushNotification(
            user.expoPushToken,
            "NutriSnap AI Coach ⚡",
            notificationText.substring(0, 150)
          );
        }
      } catch (err) {
        logger.error(`Failed to process notification for user ${user._id}: ${err.message}`);
      }
    }

    logger.info('Finished daily AI coach notification sweep.');
  } catch (err) {
    logger.error(`Daily coach job failed: ${err.message}`);
  }
};

// Schedule it to run at 9:00 AM every day
export const setupCronJobs = () => {
  cron.schedule('0 9 * * *', () => {
    runDailyCoachJob();
  });
  logger.info('Scheduled daily coach job for 9:00 AM');
};
