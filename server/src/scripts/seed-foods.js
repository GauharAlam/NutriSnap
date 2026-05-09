import mongoose from "mongoose";
import dotenv from "dotenv";
import { Food } from "../models/food.model.js";
import { foodCatalog } from "../services/nutrition/food-catalog.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fitness_nutrition_app";

/**
 * Categorize the hardcoded catalog items for the database.
 */
function getCategory(item) {
  const proteins = ["chicken", "fish", "egg", "paneer", "tofu", "soya", "whey", "salmon", "tuna", "prawns"];
  const grains = ["rice", "roti", "bread", "pasta", "oats", "poha", "upma", "idli", "dosa", "quinoa", "corn", "potato", "paratha", "naan"];
  const vegetables = ["salad", "spinach", "palak", "broccoli", "mushroom", "mixed vegetables"];
  const fruits = ["banana", "apple", "mango", "watermelon", "orange", "papaya", "grapes", "dates", "avocado"];
  const fastFood = ["burger", "pizza", "fries", "samosa", "pakora", "maggi", "biryani"];
  const lentils = ["dal", "chana", "rajma", "spruts"];

  const label = item.label.toLowerCase();
  
  if (proteins.some(p => label.includes(p))) return "Proteins";
  if (grains.some(g => label.includes(g))) return "Grains & Carbs";
  if (vegetables.some(v => label.includes(v))) return "Vegetables";
  if (fruits.some(f => label.includes(f))) return "Fruits";
  if (fastFood.some(ff => label.includes(ff))) return "Fast / Junk Food";
  if (lentils.some(l => label.includes(l))) return "Lentils & Legumes";
  if (label.includes("milk") || label.includes("yogurt") || label.includes("cheese") || label.includes("lassi") || label.includes("curd")) return "Dairy";
  if (label.includes("almond") || label.includes("peanut") || label.includes("walnut") || label.includes("seed") || label.includes("nut")) return "Nuts & Seeds";
  if (label.includes("smoothie") || label.includes("coffee") || label.includes("chai") || label.includes("juice") || label.includes("drink") || label.includes("water")) return "Drinks & Shakes";
  if (label.includes("chocolate") || label.includes("ice cream") || label.includes("ladoo") || label.includes("jamun") || label.includes("jalebi") || label.includes("bar") || label.includes("muesli")) return "Sweets & Snacks";
  if (label.includes("ghee") || label.includes("oil") || label.includes("butter")) return "Oils & Fats";
  
  return "Supplements / Misc";
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("Clearing existing foods...");
    await Food.deleteMany({});

    const foodsToInsert = foodCatalog.map(item => ({
      ...item,
      category: getCategory(item)
    }));

    console.log(`Inserting ${foodsToInsert.length} foods...`);
    await Food.insertMany(foodsToInsert);

    console.log("Foods seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding foods:", error);
    process.exit(1);
  }
}

seed();
