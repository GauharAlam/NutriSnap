import { env } from "../../config/env.js";
import { Goal } from "../../models/goal.model.js";
import { Meal } from "../../models/meal.model.js";
import { AppError } from "../../utils/app-error.js";
import { getDailyDashboard, getWeeklyDashboard } from "../../modules/progress/progress.service.js";

// ─── UPGRADED FALLBACK ADVICE ─────────────────────────────────────────────────
function buildFallbackAdvice({ goal, daily, weekly, message }) {
  const targets = goal?.dailyTargets || {};
  const summary = daily?.summary || {};
  const avgSugar = weekly?.averages?.sugar || 0;
  const adherence = weekly?.adherenceDays || 0;

  const suggestions = [];

  // Protein check (< 70% of target)
  if (summary.protein < (targets.protein || 0) * 0.7) {
    const gap = Math.round((targets.protein || 0) - (summary.protein || 0));
    suggestions.push(
      `💪 Protein is ${gap}g below your daily goal. Boost it with 2 eggs + 1 cup dahi, 100g paneer, or a scoop of protein powder in your next meal.`
    );
  }

  // Calorie overrun (> 110% of target)
  if (summary.calories > (targets.calories || 0) * 1.1) {
    suggestions.push(
      `🔥 You've exceeded your calorie target today. Make your next meal a light one — a big sabzi + dal bowl or a salad with eggs will keep you on track without feeling starved.`
    );
  }

  // Calorie undereat (< 60% of target and at least 2 meals logged)
  if (
    (summary.mealCount || 0) >= 2 &&
    summary.calories < (targets.calories || 0) * 0.6
  ) {
    suggestions.push(
      `⚡ You're well under your calorie goal for the day. Under-eating slows metabolism and recovery — add a balanced meal with carbs, protein, and healthy fats soon.`
    );
  }

  // No meals logged
  if ((summary.mealCount || 0) === 0) {
    suggestions.push(
      `📋 No meals logged yet today. Start by logging your breakfast or first meal — even a quick entry helps you stay aware and on target.`
    );
  }

  // High sugar average
  if (avgSugar > (targets.sugar || 0)) {
    suggestions.push(
      `🍬 Your weekly sugar average is above target. Try swapping one sugary item (chai with 2 tsp sugar, biscuits, fruit juice) for whole fruit, plain dahi, or nuts.`
    );
  }

  // High carb + low fat imbalance
  if (
    summary.carbs > (targets.carbs || 0) * 1.2 &&
    summary.fat < (targets.fat || 0) * 0.5
  ) {
    suggestions.push(
      `⚖️ Your carbs are high and fats are low today. Add a small handful of nuts or a teaspoon of ghee to bring your macros into better balance.`
    );
  }

  // Low weekly adherence
  if (adherence < 3) {
    suggestions.push(
      `📅 You've only hit your targets on ${adherence} day(s) this week. Pick one simple, repeatable meal you enjoy — like oats for breakfast or dal-roti for lunch — and lock it in for the next 3 days.`
    );
  }

  // All good fallback
  if (suggestions.length === 0) {
    suggestions.push(
      `✅ Your intake looks well-aligned with your goals today. Stay consistent, keep meals balanced, and make sure you're hitting your protein target by end of day.`
    );
  }

  const intro = message
    ? `You asked: "${message}"\n\nHere's your personalized coaching advice:\n`
    : `Here's your personalized coaching snapshot:\n`;

  return {
    reply: [
      intro,
      ...suggestions,
      "",
      `👉 Next step: ${suggestions[0].replace(/^[^\w]+/, "")}`,
    ].join("\n"),
    suggestions,
    source: "fallback_assistant",
  };
}

// ─── UPGRADED SYSTEM PROMPT ───────────────────────────────────────────────────
const systemPrompt = `You are FitCoach AI — a world-class personal trainer, nutritionist, and wellness coach built into a Gym & Health App. You combine the expertise of a certified personal trainer (CPT), registered dietitian, and sports psychologist.

## YOUR IDENTITY
- Name: FitCoach AI
- Tone: Warm, direct, motivating — like a knowledgeable gym buddy who keeps it real
- You remember context within the conversation and reference it naturally

## YOUR EXPERTISE AREAS
1. **Workout Programming** — strength, hypertrophy, fat loss, HIIT, mobility, home workouts
2. **Nutrition & Diet** — macros, meal timing, Indian diet (dal, sabzi, roti, rice, paneer, dahi, sprouts, etc.), budget meals, meal prep
3. **Body Composition** — weight loss, muscle gain, body recomposition
4. **Supplements** — protein powder, creatine, multivitamins, basic guidance only; never push brands
5. **Recovery** — sleep hygiene, deload weeks, stress management, injury prevention
6. **Mindset & Habits** — motivation, consistency systems, habit stacking, plateau-busting

## PERSONALIZATION RULES
- Always read the provided JSON context: goal type, daily targets, daily summary, weekly averages, recent meals
- Reference actual numbers from their data (e.g., "You hit 78g protein today — you need 42g more")
- If critical data is missing, ask ONE focused follow-up question before advising
- Adapt advice for Indian dietary patterns by default unless user specifies otherwise

## RESPONSE RULES
- Length: 6–10 lines max for general advice; up to 15 lines for workout plans or meal breakdowns
- Always use bullet points (•) for lists — never numbered unless it's a step-by-step plan
- Lead with the most impactful insight first
- Be specific, not vague — say "add 2 eggs or 100g paneer" not "eat more protein"
- End EVERY response with one clear, actionable next step prefixed with 👉
- Use emojis sparingly — only where they add warmth or clarity (max 2–3 per reply)
- Never give unsafe advice (extreme deficits, unproven supplements, injury-risking loads)
- If a question is medical (diabetes, thyroid, PCOS, injuries) → answer generally and recommend a doctor or dietitian

## INDIAN DIET INTELLIGENCE
You know these well and can build full meal plans around them:
- Proteins: paneer, dahi, eggs, chicken, dal (masoor, moong, chana), rajma, soya chunks, sprouts
- Carbs: roti (wheat/multigrain), brown rice, poha, oats, sweet potato, banana
- Fats: ghee (small amounts), nuts (badam, akhrot), seeds (til, flax), coconut
- Vegetables: all seasonal sabzis; prioritize leafy greens for micronutrients
- Common pitfalls: too much rice at night, skipping breakfast, chai with too much sugar, fried snacks

## CONTEXT FORMAT
You will receive a JSON object with:
- userGoal: goalType, dailyTargets (calories, protein, carbs, fat, sugar), notes
- daily: today's macro summary and meal count
- weekly: 7-day averages and adherence days
- recentMeals: last 5 logged meals with nutrition
- userMessage: what the user just asked

Use ALL of this data to give hyper-personalized, accurate advice.`;

// ─── AI PROVIDER CALLS (UNCHANGED) ───────────────────────────────────────────
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

// ─── MAIN EXPORT (UNCHANGED) ──────────────────────────────────────────────────
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