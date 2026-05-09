/**
 * Meal Templates Service
 *
 * Provides a curated list of healthy meal templates for users to choose from,
 * categorized by diet type, meal timing, and budget.
 */

const mealTemplates = [
  {
    id: "breakfast-oats-veg",
    title: "Protein Oatmeal with Berries",
    mealType: "breakfast",
    dietType: "vegetarian",
    timing: "pre_workout",
    budget: "low",
    foodItems: [
      { name: "oats", portionMultiplier: 1.5 },
      { name: "milk", portionMultiplier: 1 },
      { name: "banana", portionMultiplier: 1 },
      { name: "whey protein", portionMultiplier: 1 }
    ],
    description: "Slow-releasing carbs and fast protein to fuel your morning session."
  },
  {
    id: "lunch-chicken-rice",
    title: "Classic Clean Chicken & Rice",
    mealType: "lunch",
    dietType: "non_vegetarian",
    timing: "post_workout",
    budget: "medium",
    foodItems: [
      { name: "grilled chicken", portionMultiplier: 1.5 },
      { name: "rice", portionMultiplier: 1.5 },
      { name: "broccoli", portionMultiplier: 1 },
      { name: "olive oil", portionMultiplier: 0.5 }
    ],
    description: "The gold standard for muscle recovery and lean gains."
  },
  {
    id: "dinner-paneer-roti",
    title: "Paneer & Whole Wheat Roti",
    mealType: "dinner",
    dietType: "vegetarian",
    timing: "rest_day",
    budget: "low",
    foodItems: [
      { name: "paneer", portionMultiplier: 1 },
      { name: "roti", portionMultiplier: 2 },
      { name: "mixed vegetables", portionMultiplier: 1 }
    ],
    description: "Balanced vegetarian dinner with slow-digesting casein protein from paneer."
  },
  {
    id: "snack-almonds-fruit",
    title: "Energy Boost Snack",
    mealType: "snack",
    dietType: "vegan",
    timing: "mid_day",
    budget: "low",
    foodItems: [
      { name: "almonds", portionMultiplier: 1 },
      { name: "apple", portionMultiplier: 1 }
    ],
    description: "Healthy fats and fiber to keep you full between meals."
  },
  {
    id: "lunch-salmon-quinoa",
    title: "Omega-3 Power Bowl",
    mealType: "lunch",
    dietType: "non_vegetarian",
    timing: "general",
    budget: "high",
    foodItems: [
      { name: "salmon", portionMultiplier: 1 },
      { name: "quinoa", portionMultiplier: 1 },
      { name: "avocado", portionMultiplier: 1 },
      { name: "salad", portionMultiplier: 1 }
    ],
    description: "High in healthy fats and high-quality protein for brain and heart health."
  },
  {
    id: "dinner-tofu-stirfry",
    title: "Tofu & Veggie Stir-fry",
    mealType: "dinner",
    dietType: "vegan",
    timing: "rest_day",
    budget: "medium",
    foodItems: [
      { name: "tofu", portionMultiplier: 1.5 },
      { name: "brown rice", portionMultiplier: 1 },
      { name: "broccoli", portionMultiplier: 1 },
      { name: "mushroom", portionMultiplier: 1 }
    ],
    description: "A complete plant-based protein meal packed with micronutrients."
  },
  {
    id: "breakfast-eggs-toast",
    title: "Standard Eggs & Toast",
    mealType: "breakfast",
    dietType: "eggetarian",
    timing: "general",
    budget: "low",
    foodItems: [
      { name: "egg", portionMultiplier: 1.5 }, // 3 eggs
      { name: "bread", portionMultiplier: 1 },
      { name: "butter", portionMultiplier: 0.5 }
    ],
    description: "A quick and affordable high-protein breakfast."
  }
];

/**
 * List available meal templates with optional filtering.
 */
export async function listMealTemplates(filters = {}) {
  let filtered = [...mealTemplates];

  if (filters.mealType) {
    filtered = filtered.filter(t => t.mealType === filters.mealType);
  }
  if (filters.dietType) {
    filtered = filtered.filter(t => t.dietType === filters.dietType || t.dietType === "any");
  }
  if (filters.timing) {
    filtered = filtered.filter(t => t.timing === filters.timing || t.timing === "general");
  }

  return filtered;
}

/**
 * Get a specific template by ID.
 */
export async function getTemplateById(id) {
  return mealTemplates.find(t => t.id === id) || null;
}
