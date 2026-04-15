import { Meal } from "../../models/meal.model.js";
import { AppError } from "../../utils/app-error.js";

function formatMeal(meal) {
  return {
    id: meal._id.toString(),
    title: meal.title,
    mealType: meal.mealType,
    foodItems: meal.foodItems,
    notes: meal.notes,
    eatenAt: meal.eatenAt,
    imageUrl: meal.imageUrl,
    imagePath: meal.imagePath,
    nutrition: meal.nutrition,
    source: meal.source,
    createdAt: meal.createdAt,
    updatedAt: meal.updatedAt,
  };
}

function zeroSummary() {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    sugar: 0,
    mealCount: 0,
  };
}

function buildDateRange(dateString) {
  const baseDate = dateString ? new Date(`${dateString}T00:00:00`) : new Date();

  if (Number.isNaN(baseDate.getTime())) {
    throw new AppError("Date must be in YYYY-MM-DD format", 400);
  }

  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
    dateKey: dateString || `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
  };
}

function buildSummary(meals) {
  return meals.reduce(
    (summary, meal) => ({
      calories: summary.calories + meal.nutrition.calories,
      protein: summary.protein + meal.nutrition.protein,
      carbs: summary.carbs + meal.nutrition.carbs,
      fats: summary.fats + meal.nutrition.fats,
      sugar: summary.sugar + meal.nutrition.sugar,
      mealCount: summary.mealCount + 1,
    }),
    zeroSummary()
  );
}

function sanitizeFoodItems(foodItems = []) {
  return foodItems
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createMeal(userId, payload) {
  const meal = await Meal.create({
    userId,
    title: payload.title.trim(),
    mealType: payload.mealType,
    foodItems: sanitizeFoodItems(payload.foodItems),
    notes: payload.notes?.trim() || "",
    eatenAt: new Date(payload.eatenAt),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    nutrition: payload.nutrition,
    source: payload.source || (payload.imageUrl ? "image_upload" : "manual"),
  });

  return formatMeal(meal);
}

export async function listMealsForDate(userId, dateString) {
  const { start, end, dateKey } = buildDateRange(dateString);
  const meals = await Meal.find({
    userId,
    eatenAt: {
      $gte: start,
      $lte: end,
    },
  }).sort({ eatenAt: -1, createdAt: -1 });

  return {
    date: dateKey,
    summary: buildSummary(meals),
    meals: meals.map(formatMeal),
  };
}

export async function updateMeal(userId, mealId, payload) {
  const meal = await Meal.findOne({ _id: mealId, userId });

  if (!meal) {
    throw new AppError("Meal not found", 404);
  }

  if (payload.title !== undefined) {
    meal.title = payload.title.trim();
  }

  if (payload.mealType !== undefined) {
    meal.mealType = payload.mealType;
  }

  if (payload.foodItems !== undefined) {
    meal.foodItems = sanitizeFoodItems(payload.foodItems);
  }

  if (payload.notes !== undefined) {
    meal.notes = payload.notes.trim();
  }

  if (payload.eatenAt !== undefined) {
    meal.eatenAt = new Date(payload.eatenAt);
  }

  if (payload.imageUrl !== undefined) {
    meal.imageUrl = payload.imageUrl;
  }

  if (payload.imagePath !== undefined) {
    meal.imagePath = payload.imagePath;
  }

  if (payload.nutrition !== undefined) {
    meal.nutrition = payload.nutrition;
  }

  if (payload.source !== undefined) {
    meal.source = payload.source;
  }

  await meal.save();

  return formatMeal(meal);
}

export async function deleteMeal(userId, mealId) {
  const meal = await Meal.findOneAndDelete({ _id: mealId, userId });

  if (!meal) {
    throw new AppError("Meal not found", 404);
  }

  return {
    id: meal._id.toString(),
  };
}
