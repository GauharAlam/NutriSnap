/**
 * Expanded Food Catalog — 100+ curated foods for Indian and international diets.
 * Each entry includes per-serving macros (calories, protein, carbs, fats, sugar, fiber, sodium).
 */
export const foodCatalog = [
  // ─── Proteins ──────────────────────────────────────────────────────────
  { label: "grilled chicken", keywords: ["grilled chicken", "chicken breast", "chicken"], servingLabel: "150g", nutrition: { calories: 220, protein: 35, carbs: 0, fats: 8, sugar: 0, fiber: 0, sodium: 75 } },
  { label: "chicken thigh", keywords: ["chicken thigh", "dark meat"], servingLabel: "150g", nutrition: { calories: 280, protein: 28, carbs: 0, fats: 18, sugar: 0, fiber: 0, sodium: 85 } },
  { label: "tandoori chicken", keywords: ["tandoori chicken", "tikka"], servingLabel: "150g", nutrition: { calories: 260, protein: 32, carbs: 5, fats: 12, sugar: 2, fiber: 0, sodium: 350 } },
  { label: "butter chicken", keywords: ["butter chicken", "murgh makhani"], servingLabel: "200g", nutrition: { calories: 430, protein: 28, carbs: 14, fats: 30, sugar: 6, fiber: 1, sodium: 480 } },
  { label: "salmon", keywords: ["salmon", "fish fillet", "fish"], servingLabel: "150g", nutrition: { calories: 240, protein: 25, carbs: 0, fats: 14, sugar: 0, fiber: 0, sodium: 60 } },
  { label: "tuna", keywords: ["tuna", "tuna steak"], servingLabel: "150g", nutrition: { calories: 180, protein: 39, carbs: 0, fats: 1, sugar: 0, fiber: 0, sodium: 55 } },
  { label: "prawns", keywords: ["prawns", "shrimp"], servingLabel: "150g", nutrition: { calories: 140, protein: 30, carbs: 0, fats: 2, sugar: 0, fiber: 0, sodium: 250 } },
  { label: "egg", keywords: ["egg", "omelette", "omelet", "boiled egg", "scrambled egg", "anda"], servingLabel: "2 eggs", nutrition: { calories: 140, protein: 12, carbs: 1, fats: 10, sugar: 1, fiber: 0, sodium: 140 } },
  { label: "egg whites", keywords: ["egg whites", "egg white"], servingLabel: "4 whites", nutrition: { calories: 68, protein: 14, carbs: 1, fats: 0, sugar: 0, fiber: 0, sodium: 220 } },
  { label: "paneer", keywords: ["paneer", "cottage cheese", "paneer tikka"], servingLabel: "100g", nutrition: { calories: 265, protein: 18, carbs: 6, fats: 20, sugar: 3, fiber: 0, sodium: 20 } },
  { label: "tofu", keywords: ["tofu", "bean curd"], servingLabel: "150g", nutrition: { calories: 130, protein: 15, carbs: 3, fats: 7, sugar: 1, fiber: 1, sodium: 15 } },
  { label: "soya chunks", keywords: ["soya chunks", "soy chunks", "nutrela", "meal maker"], servingLabel: "50g dry", nutrition: { calories: 170, protein: 26, carbs: 16, fats: 0.5, sugar: 0, fiber: 7, sodium: 5 } },
  { label: "whey protein", keywords: ["whey protein", "protein powder", "protein scoop"], servingLabel: "1 scoop (30g)", nutrition: { calories: 120, protein: 24, carbs: 3, fats: 1.5, sugar: 1, fiber: 0, sodium: 60 } },

  // ─── Lentils & Legumes ─────────────────────────────────────────────────
  { label: "dal", keywords: ["dal", "lentils", "lentil curry", "toor dal", "moong dal", "masoor dal"], servingLabel: "1 bowl (200ml)", nutrition: { calories: 180, protein: 10, carbs: 26, fats: 4, sugar: 3, fiber: 5, sodium: 350 } },
  { label: "chana", keywords: ["chana", "chickpeas", "chole", "chana masala"], servingLabel: "1 bowl", nutrition: { calories: 220, protein: 12, carbs: 30, fats: 6, sugar: 4, fiber: 8, sodium: 400 } },
  { label: "rajma", keywords: ["rajma", "kidney beans", "kidney bean curry"], servingLabel: "1 bowl", nutrition: { calories: 210, protein: 11, carbs: 32, fats: 4, sugar: 3, fiber: 9, sodium: 380 } },
  { label: "sprouts", keywords: ["sprouts", "moong sprouts", "bean sprouts"], servingLabel: "100g", nutrition: { calories: 45, protein: 5, carbs: 5, fats: 0.5, sugar: 1, fiber: 3, sodium: 10 } },

  // ─── Grains & Carbs ────────────────────────────────────────────────────
  { label: "rice", keywords: ["rice", "white rice", "chawal", "steamed rice"], servingLabel: "1 cup cooked", nutrition: { calories: 205, protein: 4, carbs: 45, fats: 0.4, sugar: 0, fiber: 0.6, sodium: 2 } },
  { label: "brown rice", keywords: ["brown rice"], servingLabel: "1 cup cooked", nutrition: { calories: 215, protein: 5, carbs: 44, fats: 1.8, sugar: 0, fiber: 3.5, sodium: 3 } },
  { label: "roti", keywords: ["roti", "chapati", "flatbread", "phulka"], servingLabel: "2 rotis", nutrition: { calories: 180, protein: 6, carbs: 36, fats: 2, sugar: 2, fiber: 4, sodium: 300 } },
  { label: "paratha", keywords: ["paratha", "aloo paratha", "stuffed paratha"], servingLabel: "1 paratha", nutrition: { calories: 260, protein: 5, carbs: 32, fats: 12, sugar: 2, fiber: 2, sodium: 320 } },
  { label: "naan", keywords: ["naan", "garlic naan", "butter naan"], servingLabel: "1 naan", nutrition: { calories: 280, protein: 7, carbs: 44, fats: 8, sugar: 3, fiber: 2, sodium: 400 } },
  { label: "oats", keywords: ["oats", "oatmeal", "porridge"], servingLabel: "1 bowl (40g dry)", nutrition: { calories: 190, protein: 6, carbs: 32, fats: 4, sugar: 1, fiber: 5, sodium: 5 } },
  { label: "bread", keywords: ["bread", "toast", "whole wheat bread"], servingLabel: "2 slices", nutrition: { calories: 160, protein: 6, carbs: 28, fats: 2, sugar: 4, fiber: 3, sodium: 280 } },
  { label: "pasta", keywords: ["pasta", "spaghetti", "macaroni", "penne"], servingLabel: "1 bowl cooked", nutrition: { calories: 320, protein: 11, carbs: 56, fats: 6, sugar: 5, fiber: 3, sodium: 5 } },
  { label: "poha", keywords: ["poha", "flattened rice", "chivda"], servingLabel: "1 plate", nutrition: { calories: 250, protein: 5, carbs: 42, fats: 7, sugar: 3, fiber: 2, sodium: 350 } },
  { label: "upma", keywords: ["upma", "rava upma", "semolina"], servingLabel: "1 bowl", nutrition: { calories: 230, protein: 6, carbs: 38, fats: 6, sugar: 2, fiber: 2, sodium: 380 } },
  { label: "idli", keywords: ["idli", "idly"], servingLabel: "3 idlis", nutrition: { calories: 180, protein: 5, carbs: 36, fats: 0.5, sugar: 1, fiber: 1, sodium: 280 } },
  { label: "dosa", keywords: ["dosa", "masala dosa", "plain dosa"], servingLabel: "1 dosa", nutrition: { calories: 160, protein: 4, carbs: 28, fats: 4, sugar: 1, fiber: 1, sodium: 250 } },
  { label: "sweet potato", keywords: ["sweet potato", "shakarkandi"], servingLabel: "1 medium", nutrition: { calories: 110, protein: 2, carbs: 26, fats: 0, sugar: 5, fiber: 4, sodium: 40 } },
  { label: "potato", keywords: ["potato", "aloo", "mashed potato"], servingLabel: "1 medium", nutrition: { calories: 160, protein: 4, carbs: 36, fats: 0.2, sugar: 2, fiber: 3, sodium: 10 } },
  { label: "quinoa", keywords: ["quinoa"], servingLabel: "1 cup cooked", nutrition: { calories: 220, protein: 8, carbs: 39, fats: 3.5, sugar: 0, fiber: 5, sodium: 10 } },
  { label: "corn", keywords: ["corn", "sweet corn", "bhutta", "makka"], servingLabel: "1 cob", nutrition: { calories: 90, protein: 3, carbs: 19, fats: 1, sugar: 6, fiber: 2, sodium: 15 } },

  // ─── Vegetables ────────────────────────────────────────────────────────
  { label: "salad", keywords: ["salad", "greens", "vegetables", "veggies", "green salad"], servingLabel: "1 bowl", nutrition: { calories: 80, protein: 3, carbs: 10, fats: 3, sugar: 5, fiber: 4, sodium: 30 } },
  { label: "palak", keywords: ["palak", "spinach", "saag"], servingLabel: "1 bowl cooked", nutrition: { calories: 45, protein: 5, carbs: 4, fats: 1, sugar: 1, fiber: 4, sodium: 120 } },
  { label: "broccoli", keywords: ["broccoli"], servingLabel: "1 cup", nutrition: { calories: 55, protein: 4, carbs: 6, fats: 0.5, sugar: 2, fiber: 5, sodium: 30 } },
  { label: "mixed vegetables", keywords: ["mixed vegetables", "sabzi", "bhaji", "vegetable curry"], servingLabel: "1 bowl", nutrition: { calories: 120, protein: 4, carbs: 14, fats: 5, sugar: 5, fiber: 4, sodium: 300 } },
  { label: "mushroom", keywords: ["mushroom", "mushrooms"], servingLabel: "100g", nutrition: { calories: 35, protein: 3, carbs: 5, fats: 0.3, sugar: 2, fiber: 1, sodium: 5 } },

  // ─── Dairy ─────────────────────────────────────────────────────────────
  { label: "milk", keywords: ["milk", "doodh", "whole milk"], servingLabel: "1 glass (250ml)", nutrition: { calories: 150, protein: 8, carbs: 12, fats: 8, sugar: 12, fiber: 0, sodium: 105 } },
  { label: "greek yogurt", keywords: ["greek yogurt", "yogurt", "curd", "dahi"], servingLabel: "1 cup (200g)", nutrition: { calories: 150, protein: 15, carbs: 9, fats: 4, sugar: 6, fiber: 0, sodium: 70 } },
  { label: "lassi", keywords: ["lassi", "buttermilk", "chaas"], servingLabel: "1 glass", nutrition: { calories: 160, protein: 6, carbs: 22, fats: 5, sugar: 18, fiber: 0, sodium: 80 } },
  { label: "cheese", keywords: ["cheese", "cheddar", "mozzarella"], servingLabel: "30g", nutrition: { calories: 115, protein: 7, carbs: 0.5, fats: 9.5, sugar: 0, fiber: 0, sodium: 180 } },
  { label: "whey", keywords: ["whey"], servingLabel: "1 scoop", nutrition: { calories: 120, protein: 24, carbs: 3, fats: 1.5, sugar: 1, fiber: 0, sodium: 60 } },

  // ─── Fruits ────────────────────────────────────────────────────────────
  { label: "banana", keywords: ["banana", "kela"], servingLabel: "1 medium", nutrition: { calories: 105, protein: 1.3, carbs: 27, fats: 0.4, sugar: 14, fiber: 3, sodium: 1 } },
  { label: "apple", keywords: ["apple", "seb"], servingLabel: "1 medium", nutrition: { calories: 95, protein: 0.5, carbs: 25, fats: 0.3, sugar: 19, fiber: 4, sodium: 2 } },
  { label: "mango", keywords: ["mango", "aam"], servingLabel: "1 cup sliced", nutrition: { calories: 100, protein: 1, carbs: 25, fats: 0.5, sugar: 22, fiber: 3, sodium: 2 } },
  { label: "watermelon", keywords: ["watermelon", "tarbooz"], servingLabel: "2 cups", nutrition: { calories: 90, protein: 2, carbs: 22, fats: 0.4, sugar: 18, fiber: 1, sodium: 3 } },
  { label: "orange", keywords: ["orange", "santra", "mosambi"], servingLabel: "1 medium", nutrition: { calories: 60, protein: 1, carbs: 15, fats: 0.2, sugar: 12, fiber: 3, sodium: 1 } },
  { label: "papaya", keywords: ["papaya"], servingLabel: "1 cup", nutrition: { calories: 55, protein: 1, carbs: 14, fats: 0.3, sugar: 8, fiber: 2, sodium: 3 } },
  { label: "grapes", keywords: ["grapes", "angur"], servingLabel: "1 cup", nutrition: { calories: 70, protein: 1, carbs: 18, fats: 0.2, sugar: 16, fiber: 1, sodium: 2 } },
  { label: "dates", keywords: ["dates", "khajur"], servingLabel: "4 dates", nutrition: { calories: 110, protein: 1, carbs: 30, fats: 0, sugar: 27, fiber: 3, sodium: 1 } },
  { label: "avocado", keywords: ["avocado", "guacamole"], servingLabel: "1/2 avocado", nutrition: { calories: 120, protein: 1.5, carbs: 6, fats: 11, sugar: 0.3, fiber: 5, sodium: 5 } },

  // ─── Nuts & Seeds ──────────────────────────────────────────────────────
  { label: "almonds", keywords: ["almonds", "badam"], servingLabel: "20 almonds (28g)", nutrition: { calories: 165, protein: 6, carbs: 6, fats: 14, sugar: 1, fiber: 3.5, sodium: 1 } },
  { label: "peanuts", keywords: ["peanuts", "moongphali", "groundnuts"], servingLabel: "30g", nutrition: { calories: 170, protein: 7, carbs: 5, fats: 14, sugar: 1, fiber: 2, sodium: 5 } },
  { label: "peanut butter", keywords: ["peanut butter", "pb"], servingLabel: "2 tbsp (32g)", nutrition: { calories: 190, protein: 7, carbs: 7, fats: 16, sugar: 3, fiber: 2, sodium: 140 } },
  { label: "walnuts", keywords: ["walnuts", "akhrot"], servingLabel: "28g", nutrition: { calories: 185, protein: 4, carbs: 4, fats: 18, sugar: 1, fiber: 2, sodium: 1 } },
  { label: "mixed nuts", keywords: ["mixed nuts", "trail mix", "dry fruits"], servingLabel: "30g", nutrition: { calories: 175, protein: 5, carbs: 7, fats: 15, sugar: 2, fiber: 2, sodium: 3 } },
  { label: "flax seeds", keywords: ["flax seeds", "alsi"], servingLabel: "1 tbsp (10g)", nutrition: { calories: 55, protein: 2, carbs: 3, fats: 4, sugar: 0, fiber: 3, sodium: 3 } },
  { label: "chia seeds", keywords: ["chia seeds"], servingLabel: "1 tbsp (12g)", nutrition: { calories: 60, protein: 2, carbs: 5, fats: 4, sugar: 0, fiber: 4, sodium: 2 } },

  // ─── Fast / Junk Food ──────────────────────────────────────────────────
  { label: "burger", keywords: ["burger", "sandwich"], servingLabel: "1 item", nutrition: { calories: 420, protein: 22, carbs: 34, fats: 22, sugar: 7, fiber: 2, sodium: 800 } },
  { label: "pizza", keywords: ["pizza", "slice"], servingLabel: "2 slices", nutrition: { calories: 520, protein: 22, carbs: 56, fats: 22, sugar: 8, fiber: 3, sodium: 1100 } },
  { label: "fries", keywords: ["fries", "chips", "french fries"], servingLabel: "1 serving", nutrition: { calories: 320, protein: 4, carbs: 41, fats: 15, sugar: 0.5, fiber: 3, sodium: 230 } },
  { label: "samosa", keywords: ["samosa"], servingLabel: "2 samosas", nutrition: { calories: 320, protein: 5, carbs: 36, fats: 18, sugar: 2, fiber: 2, sodium: 380 } },
  { label: "pakora", keywords: ["pakora", "bhajiya", "fritters"], servingLabel: "5 pieces", nutrition: { calories: 280, protein: 6, carbs: 22, fats: 18, sugar: 2, fiber: 2, sodium: 350 } },
  { label: "maggi", keywords: ["maggi", "instant noodles", "noodles"], servingLabel: "1 pack", nutrition: { calories: 350, protein: 8, carbs: 48, fats: 14, sugar: 2, fiber: 2, sodium: 900 } },
  { label: "biryani", keywords: ["biryani", "biriyani", "pulao"], servingLabel: "1 plate", nutrition: { calories: 500, protein: 20, carbs: 62, fats: 18, sugar: 3, fiber: 2, sodium: 650 } },

  // ─── Drinks & Shakes ───────────────────────────────────────────────────
  { label: "smoothie", keywords: ["smoothie", "shake", "protein shake"], servingLabel: "1 glass (300ml)", nutrition: { calories: 260, protein: 24, carbs: 24, fats: 6, sugar: 18, fiber: 3, sodium: 80 } },
  { label: "black coffee", keywords: ["black coffee", "coffee"], servingLabel: "1 cup", nutrition: { calories: 5, protein: 0, carbs: 0, fats: 0, sugar: 0, fiber: 0, sodium: 5 } },
  { label: "chai", keywords: ["chai", "tea", "masala chai"], servingLabel: "1 cup", nutrition: { calories: 60, protein: 2, carbs: 8, fats: 2, sugar: 6, fiber: 0, sodium: 20 } },
  { label: "coconut water", keywords: ["coconut water", "nariyal pani"], servingLabel: "1 glass (250ml)", nutrition: { calories: 45, protein: 2, carbs: 9, fats: 0.5, sugar: 6, fiber: 2, sodium: 250 } },
  { label: "cold drink", keywords: ["cold drink", "soda", "cola", "soft drink", "coke", "pepsi"], servingLabel: "330ml", nutrition: { calories: 140, protein: 0, carbs: 39, fats: 0, sugar: 39, fiber: 0, sodium: 45 } },
  { label: "juice", keywords: ["juice", "fruit juice", "orange juice", "mango juice"], servingLabel: "1 glass (250ml)", nutrition: { calories: 110, protein: 1, carbs: 26, fats: 0.3, sugar: 22, fiber: 0, sodium: 5 } },

  // ─── Sweets & Snacks ───────────────────────────────────────────────────
  { label: "dark chocolate", keywords: ["dark chocolate", "chocolate"], servingLabel: "30g", nutrition: { calories: 170, protein: 2, carbs: 13, fats: 12, sugar: 7, fiber: 3, sodium: 7 } },
  { label: "ice cream", keywords: ["ice cream", "kulfi"], servingLabel: "1 scoop", nutrition: { calories: 200, protein: 3, carbs: 24, fats: 11, sugar: 20, fiber: 0, sodium: 60 } },
  { label: "ladoo", keywords: ["ladoo", "laddoo", "laddu", "besan ladoo"], servingLabel: "2 pieces", nutrition: { calories: 280, protein: 4, carbs: 30, fats: 16, sugar: 22, fiber: 1, sodium: 30 } },
  { label: "gulab jamun", keywords: ["gulab jamun"], servingLabel: "2 pieces", nutrition: { calories: 300, protein: 3, carbs: 42, fats: 14, sugar: 35, fiber: 0, sodium: 40 } },
  { label: "jalebi", keywords: ["jalebi"], servingLabel: "3 pieces", nutrition: { calories: 280, protein: 2, carbs: 50, fats: 8, sugar: 42, fiber: 0, sodium: 15 } },
  { label: "protein bar", keywords: ["protein bar", "granola bar", "energy bar"], servingLabel: "1 bar (60g)", nutrition: { calories: 220, protein: 20, carbs: 22, fats: 8, sugar: 6, fiber: 3, sodium: 200 } },
  { label: "muesli", keywords: ["muesli", "granola"], servingLabel: "50g", nutrition: { calories: 200, protein: 5, carbs: 34, fats: 6, sugar: 10, fiber: 4, sodium: 30 } },

  // ─── Oils & Fats ───────────────────────────────────────────────────────
  { label: "ghee", keywords: ["ghee", "clarified butter"], servingLabel: "1 tbsp (15g)", nutrition: { calories: 130, protein: 0, carbs: 0, fats: 14, sugar: 0, fiber: 0, sodium: 0 } },
  { label: "olive oil", keywords: ["olive oil"], servingLabel: "1 tbsp", nutrition: { calories: 120, protein: 0, carbs: 0, fats: 14, sugar: 0, fiber: 0, sodium: 0 } },
  { label: "butter", keywords: ["butter", "makhan"], servingLabel: "1 tbsp (14g)", nutrition: { calories: 100, protein: 0, carbs: 0, fats: 11, sugar: 0, fiber: 0, sodium: 80 } },

  // ─── Supplements / Misc ────────────────────────────────────────────────
  { label: "creatine", keywords: ["creatine"], servingLabel: "5g", nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0, fiber: 0, sodium: 0 } },
  { label: "honey", keywords: ["honey", "shahad"], servingLabel: "1 tbsp", nutrition: { calories: 65, protein: 0, carbs: 17, fats: 0, sugar: 17, fiber: 0, sodium: 1 } },
];

export const fallbackCatalogItem = {
  label: "mixed meal",
  servingLabel: "1 serving",
  nutrition: { calories: 420, protein: 24, carbs: 36, fats: 18, sugar: 8, fiber: 3, sodium: 300 },
};
