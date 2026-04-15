const foodCatalog = [
  {
    label: "grilled chicken",
    keywords: ["grilled chicken", "chicken breast", "chicken"],
    servingLabel: "1 serving",
    nutrition: { calories: 220, protein: 35, carbs: 0, fats: 8, sugar: 0 },
  },
  {
    label: "rice",
    keywords: ["rice", "white rice", "brown rice"],
    servingLabel: "1 cup",
    nutrition: { calories: 205, protein: 4, carbs: 45, fats: 0.4, sugar: 0 },
  },
  {
    label: "avocado",
    keywords: ["avocado", "guacamole"],
    servingLabel: "1/2 avocado",
    nutrition: { calories: 120, protein: 1.5, carbs: 6, fats: 11, sugar: 0.3 },
  },
  {
    label: "egg",
    keywords: ["egg", "omelette", "omelet", "boiled egg", "scrambled egg"],
    servingLabel: "2 eggs",
    nutrition: { calories: 140, protein: 12, carbs: 1, fats: 10, sugar: 1 },
  },
  {
    label: "oats",
    keywords: ["oats", "oatmeal", "porridge"],
    servingLabel: "1 bowl",
    nutrition: { calories: 190, protein: 6, carbs: 32, fats: 4, sugar: 1 },
  },
  {
    label: "banana",
    keywords: ["banana"],
    servingLabel: "1 banana",
    nutrition: { calories: 105, protein: 1.3, carbs: 27, fats: 0.4, sugar: 14 },
  },
  {
    label: "greek yogurt",
    keywords: ["greek yogurt", "yogurt", "curd"],
    servingLabel: "1 cup",
    nutrition: { calories: 150, protein: 15, carbs: 9, fats: 4, sugar: 6 },
  },
  {
    label: "salmon",
    keywords: ["salmon", "fish fillet", "fish"],
    servingLabel: "1 fillet",
    nutrition: { calories: 240, protein: 25, carbs: 0, fats: 14, sugar: 0 },
  },
  {
    label: "paneer",
    keywords: ["paneer", "cottage cheese"],
    servingLabel: "100g",
    nutrition: { calories: 265, protein: 18, carbs: 6, fats: 20, sugar: 3 },
  },
  {
    label: "dal",
    keywords: ["dal", "lentils", "lentil curry"],
    servingLabel: "1 bowl",
    nutrition: { calories: 180, protein: 10, carbs: 26, fats: 4, sugar: 3 },
  },
  {
    label: "roti",
    keywords: ["roti", "chapati", "flatbread"],
    servingLabel: "2 rotis",
    nutrition: { calories: 180, protein: 6, carbs: 36, fats: 2, sugar: 2 },
  },
  {
    label: "salad",
    keywords: ["salad", "greens", "vegetables", "veggies"],
    servingLabel: "1 bowl",
    nutrition: { calories: 80, protein: 3, carbs: 10, fats: 3, sugar: 5 },
  },
  {
    label: "pasta",
    keywords: ["pasta", "spaghetti", "macaroni"],
    servingLabel: "1 bowl",
    nutrition: { calories: 320, protein: 11, carbs: 56, fats: 6, sugar: 5 },
  },
  {
    label: "burger",
    keywords: ["burger", "sandwich"],
    servingLabel: "1 item",
    nutrition: { calories: 420, protein: 22, carbs: 34, fats: 22, sugar: 7 },
  },
  {
    label: "pizza",
    keywords: ["pizza", "slice"],
    servingLabel: "2 slices",
    nutrition: { calories: 520, protein: 22, carbs: 56, fats: 22, sugar: 8 },
  },
  {
    label: "fries",
    keywords: ["fries", "chips", "french fries"],
    servingLabel: "1 serving",
    nutrition: { calories: 320, protein: 4, carbs: 41, fats: 15, sugar: 0.5 },
  },
  {
    label: "smoothie",
    keywords: ["smoothie", "shake", "protein shake"],
    servingLabel: "1 glass",
    nutrition: { calories: 260, protein: 24, carbs: 24, fats: 6, sugar: 18 },
  },
];

const fallbackCatalogItem = {
  label: "mixed meal",
  servingLabel: "1 serving",
  nutrition: { calories: 420, protein: 24, carbs: 36, fats: 18, sugar: 8 },
};

function round(value) {
  return Math.round(value * 10) / 10;
}

function normalizeMultiplier(multiplier) {
  const value = Number(multiplier);

  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

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
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      sugar: 0,
    }
  );

  return {
    items: normalizedItems,
    totals,
  };
}

export function inferFoodsFromFilename(originalName = "") {
  const normalized = originalName.toLowerCase().replace(/[^a-z0-9]+/g, " ");

  const matched = foodCatalog
    .filter((item) => item.keywords.some((keyword) => normalized.includes(keyword)))
    .slice(0, 4)
    .map((item) => ({
      name: item.label,
      portionMultiplier: 1,
    }));

  if (matched.length > 0) {
    return matched;
  }

  return [
    { name: "mixed meal", portionMultiplier: 1 },
    { name: "rice", portionMultiplier: 1 },
    { name: "grilled chicken", portionMultiplier: 1 },
  ];
}
