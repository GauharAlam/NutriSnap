import { env } from "../../config/env.js";
import { Goal } from "../../models/goal.model.js";
import { Meal } from "../../models/meal.model.js";
import { AppError } from "../../utils/app-error.js";
import { getDailyDashboard, getWeeklyDashboard } from "../../modules/progress/progress.service.js";

function buildFallbackAdvice({ goal, daily, weekly, message }) {
  const suggestions = [];

  if (daily.summary.protein < (goal?.dailyTargets?.protein || 0) * 0.7) {
    suggestions.push("Protein is tracking below goal. Add a lean protein source in your next meal, such as chicken, Greek yogurt, eggs, tofu, or paneer.");
  }

  if (daily.summary.calories > (goal?.dailyTargets?.calories || 0) * 1.1) {
    suggestions.push("Calories are already above your daily target. Keep the next meal lighter and prioritize vegetables plus protein.");
  }

  if (daily.summary.mealCount === 0) {
    suggestions.push("No meals are logged today yet. Start by logging your first real meal so the app can give better feedback.");
  }

  if (weekly.averages.sugar > (goal?.dailyTargets?.sugar || 0)) {
    suggestions.push("Your weekly sugar average is above target. Try swapping one sweet snack or drink for fruit, yogurt, or a higher-protein option.");
  }

  if (weekly.adherenceDays < 3) {
    suggestions.push("Consistency looks uneven this week. Aim for one simple repeatable meal pattern you can hit for the next 2 to 3 days.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Your intake is reasonably aligned with your targets. Keep meals balanced and focus on repeating what has been working.");
  }

  return {
    reply: [
      `You asked: ${message || "How can I improve my diet today?"}`,
      "",
      ...suggestions.map((tip, index) => `${index + 1}. ${tip}`),
    ].join("\n"),
    suggestions,
    source: "fallback_assistant",
  };
}

async function callOpenAiAssistant(context) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are a fitness nutrition assistant. Give concise, practical, non-medical meal advice based on the user's goal and recent logged intake. Focus on one to three actionable changes.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(context),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`OpenAI assistant failed: ${errorText}`, 502);
  }

  const data = await response.json();
  return {
    reply: data.output_text || "No assistant response was returned.",
    suggestions: [],
    source: "openai_assistant",
  };
}

export async function getAssistantAdvice(userId, message) {
  const [goal, daily, weekly, recentMeals] = await Promise.all([
    Goal.findOne({ userId }),
    getDailyDashboard(userId),
    getWeeklyDashboard(userId),
    Meal.find({ userId }).sort({ eatenAt: -1 }).limit(5).select("title mealType nutrition eatenAt"),
  ]);

  const context = {
    userGoal: goal
      ? {
          goalType: goal.goalType,
          dailyTargets: goal.dailyTargets,
          notes: goal.notes,
        }
      : null,
    daily,
    weekly,
    recentMeals,
    userMessage: message,
  };

  try {
    if (env.openaiApiKey) {
      return await callOpenAiAssistant(context);
    }
  } catch (error) {
    return {
      ...buildFallbackAdvice({ goal, daily, weekly, message }),
      source: "fallback_after_error",
      error: error.message,
    };
  }

  return buildFallbackAdvice({ goal, daily, weekly, message });
}
