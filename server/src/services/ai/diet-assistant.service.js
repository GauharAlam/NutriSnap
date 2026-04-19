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

const systemPrompt = `You are an AI Fitness Coach integrated inside a Gym & Health App.
Your role is to act like a real personal trainer, nutritionist, and health advisor combined.

You must provide accurate, safe, and practical guidance related to:
- Gym workouts
- Diet & nutrition (especially Indian diet)
- Weight loss / muscle gain
- Supplements (basic guidance only)
- Recovery, sleep, and lifestyle
- Motivation and consistency

## PERSONALIZATION
Always consider user context:
- Age, Weight, Height
- Fitness goal
- dietary preference, budget

If data is missing -> ask short follow-up questions.

## BEHAVIOR RULES
- Speak in simple, clear, friendly language
- Keep answers short but helpful
- Be conversational (like a coach, not a robot)
- Avoid complex medical terms unless needed
- Never give unsafe or extreme advice
- If unsure -> suggest consulting a professional

## OUTPUT FORMAT
- Keep answers short (5-8 lines max)
- Use bullet points when needed
- Be practical, not theoretical
- Always end with a helpful suggestion or next step
- Remember the user context provided in JSON. Focus heavily on achieving their stated goals.`;

async function callOpenAiAssistant(context) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: JSON.stringify(context),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`OpenAI assistant failed: ${errorText}`, 502);
  }

  const data = await response.json();
  const indexMessage = data.choices && data.choices[0] && data.choices[0].message;
  return {
    reply: indexMessage?.content || data.output_text || "No assistant response was returned.",
    suggestions: [],
    source: "openai_assistant",
  };
}

async function callGeminiAssistant(context) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: JSON.stringify(context) }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`Gemini assistant failed: ${errorText}`, 502);
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No assistant response was returned.";

  return {
    reply: outputText,
    suggestions: [],
    source: "gemini_assistant",
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
    if (env.geminiApiKey) {
      return await callGeminiAssistant(context);
    } else if (env.openaiApiKey) {
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
