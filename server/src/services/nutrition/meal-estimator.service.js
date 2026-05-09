import { foodCatalog, fallbackCatalogItem } from "./food-catalog.js";

function round(value) {
  return Math.round(value * 10) / 10;
}

function normalizeMultiplier(multiplier) {
  const value = Number(multiplier);
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.min(4, value);
}

function findCatalogItem(name) {
  const normalized = String(name || "").toLowerCase();
  return (
    foodCatalog.find((item) =>
      item.keywords.some((keyword) => normalized.includes(keyword))
    ) || null
  );
}

export function estimateNutritionFromItems(foodItems = []) {
  const normalizedItems = foodItems.map((item) => {
    const catalogItem = findCatalogItem(item.name);
    const multiplier = normalizeMultiplier(item.portionMultiplier);
    const base = catalogItem || fallbackCatalogItem;

    return {
      name: item.name,
      matchedFood: base.label,
      portionMultiplier: multiplier,
      servingLabel: base.servingLabel,
      estimatedNutrition: {
        calories: round(base.nutrition.calories * multiplier),
        protein: round(base.nutrition.protein * multiplier),
        carbs: round(base.nutrition.carbs * multiplier),
        fats: round(base.nutrition.fats * multiplier),
        sugar: round(base.nutrition.sugar * multiplier),
        fiber: round((base.nutrition.fiber || 0) * multiplier),
        sodium: round((base.nutrition.sodium || 0) * multiplier),
      },
    };
  });

  const totals = normalizedItems.reduce(
    (summary, item) => ({
      calories: round(summary.calories + item.estimatedNutrition.calories),
      protein: round(summary.protein + item.estimatedNutrition.protein),
      carbs: round(summary.carbs + item.estimatedNutrition.carbs),
      fats: round(summary.fats + item.estimatedNutrition.fats),
      sugar: round(summary.sugar + item.estimatedNutrition.sugar),
      fiber: round(summary.fiber + item.estimatedNutrition.fiber),
      sodium: round(summary.sodium + item.estimatedNutrition.sodium),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0, fiber: 0, sodium: 0 }
  );

  return { items: normalizedItems, totals };
}

export function inferFoodsFromFilename(originalName = "") {
  const normalized = originalName.toLowerCase().replace(/[^a-z0-9]+/g, " ");

  const matched = foodCatalog
    .filter((item) => item.keywords.some((keyword) => normalized.includes(keyword)))
    .slice(0, 4)
    .map((item) => ({ name: item.label, portionMultiplier: 1 }));

  if (matched.length > 0) return matched;

  return [
    { name: "mixed meal", portionMultiplier: 1 },
    { name: "rice", portionMultiplier: 1 },
    { name: "grilled chicken", portionMultiplier: 1 },
  ];
}
