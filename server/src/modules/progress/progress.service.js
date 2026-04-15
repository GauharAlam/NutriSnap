import { Goal } from "../../models/goal.model.js";
import { Meal } from "../../models/meal.model.js";

function toYmd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildSummaryAccumulator() {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    sugar: 0,
    mealCount: 0,
  };
}

function sumMeals(meals) {
  return meals.reduce((summary, meal) => {
    summary.calories += meal.nutrition.calories;
    summary.protein += meal.nutrition.protein;
    summary.carbs += meal.nutrition.carbs;
    summary.fats += meal.nutrition.fats;
    summary.sugar += meal.nutrition.sugar;
    summary.mealCount += 1;
    return summary;
  }, buildSummaryAccumulator());
}

function buildComparison(summary, target = buildSummaryAccumulator()) {
  return {
    caloriesRemaining: Math.max(0, Math.round((target.calories || 0) - summary.calories)),
    proteinRemaining: Math.max(0, Math.round((target.protein || 0) - summary.protein)),
    carbsRemaining: Math.max(0, Math.round((target.carbs || 0) - summary.carbs)),
    fatsRemaining: Math.max(0, Math.round((target.fats || 0) - summary.fats)),
    sugarRemaining: Math.max(0, Math.round((target.sugar || 0) - summary.sugar)),
    caloriesProgress: target.calories ? Math.round((summary.calories / target.calories) * 100) : 0,
    proteinProgress: target.protein ? Math.round((summary.protein / target.protein) * 100) : 0,
  };
}

function getLocalDateRange(dateString) {
  const date = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
    dateKey: toYmd(start),
  };
}

function startOfWeek(date) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  current.setHours(0, 0, 0, 0);
  return current;
}

function buildWeeklyBreakdown(meals, startDate, target) {
  const mealsByDay = new Map();

  for (const meal of meals) {
    const key = toYmd(new Date(meal.eatenAt));
    const existing = mealsByDay.get(key) || [];
    existing.push(meal);
    mealsByDay.set(key, existing);
  }

  const days = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + offset);
    const key = toYmd(date);
    const dayMeals = mealsByDay.get(key) || [];
    const summary = sumMeals(dayMeals);

    days.push({
      date: key,
      summary,
      comparison: buildComparison(summary, target),
    });
  }

  return days;
}

function buildWeeklyAverages(days) {
  if (days.length === 0) {
    return buildSummaryAccumulator();
  }

  return {
    calories: Math.round(days.reduce((sum, day) => sum + day.summary.calories, 0) / days.length),
    protein: Math.round(days.reduce((sum, day) => sum + day.summary.protein, 0) / days.length),
    carbs: Math.round(days.reduce((sum, day) => sum + day.summary.carbs, 0) / days.length),
    fats: Math.round(days.reduce((sum, day) => sum + day.summary.fats, 0) / days.length),
    sugar: Math.round(days.reduce((sum, day) => sum + day.summary.sugar, 0) / days.length),
    mealCount: Math.round(days.reduce((sum, day) => sum + day.summary.mealCount, 0) / days.length),
  };
}

export async function getDailyDashboard(userId, dateString) {
  const { start, end, dateKey } = getLocalDateRange(dateString);
  const [goal, meals] = await Promise.all([
    Goal.findOne({ userId }),
    Meal.find({
      userId,
      eatenAt: { $gte: start, $lte: end },
    }).sort({ eatenAt: -1 }),
  ]);

  const summary = sumMeals(meals);
  const target = goal?.dailyTargets || buildSummaryAccumulator();

  return {
    date: dateKey,
    target,
    summary,
    comparison: buildComparison(summary, target),
    meals: meals.length,
  };
}

export async function getWeeklyDashboard(userId, weekStartString) {
  const baseDate = weekStartString ? new Date(`${weekStartString}T00:00:00`) : new Date();
  const start = startOfWeek(baseDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const [goal, meals] = await Promise.all([
    Goal.findOne({ userId }),
    Meal.find({
      userId,
      eatenAt: { $gte: start, $lte: end },
    }).sort({ eatenAt: 1 }),
  ]);

  const target = goal?.dailyTargets || buildSummaryAccumulator();
  const days = buildWeeklyBreakdown(meals, start, target);

  return {
    weekStart: toYmd(start),
    weekEnd: toYmd(end),
    target,
    averages: buildWeeklyAverages(days),
    totals: sumMeals(meals),
    adherenceDays: days.filter((day) => day.comparison.caloriesProgress >= 80 && day.comparison.caloriesProgress <= 120).length,
    days,
  };
}

export const progressHelpers = {
  sumMeals,
  buildComparison,
  buildWeeklyBreakdown,
  buildWeeklyAverages,
};
