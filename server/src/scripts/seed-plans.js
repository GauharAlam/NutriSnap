import mongoose from "mongoose";
import dotenv from "dotenv";
import { WorkoutPlan } from "../models/workout-plan.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fitness_nutrition_app";

const plans = [
  {
    slug: "full-body-blast",
    title: "Full Body Blast",
    category: "Strength",
    duration: "45 mins",
    difficulty: "Beginner",
    calories: 350,
    muscles: ["Chest", "Back", "Legs", "Shoulders"],
    description: "A complete full-body workout designed for beginners to build foundational strength.",
    exercises: [
      { name: "Barbell Squats", sets: 3, reps: 10, rest: 90, icon: "🦵", instructions: ["Keep back straight", "Go parallel"] },
      { name: "Push-ups", sets: 3, reps: 15, rest: 60, icon: "🤸", instructions: ["Chest to floor", "Elbows at 45 degrees"] },
      { name: "Lat Pulldowns", sets: 3, reps: 12, rest: 60, icon: "⬇️", instructions: ["Pull to upper chest", "Squeeze shoulder blades"] },
      { name: "Overhead Press", sets: 3, reps: 10, rest: 90, icon: "⬆️", instructions: ["Don't arch back", "Full lockout"] },
    ],
  },
  {
    slug: "push-power",
    title: "Push Power",
    category: "Hypertrophy",
    duration: "60 mins",
    difficulty: "Intermediate",
    calories: 450,
    muscles: ["Chest", "Shoulders", "Triceps"],
    description: "Focus on pushing movements to develop a strong upper body.",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, rest: 120, icon: "🏋️" },
      { name: "Incline DB Press", sets: 3, reps: 12, rest: 90, icon: "📈" },
      { name: "Lateral Raises", sets: 4, reps: 15, rest: 60, icon: "👐" },
      { name: "Tricep Pushdowns", sets: 3, reps: 12, rest: 60, icon: "⬇️" },
    ],
  },
  {
    slug: "pull-strength",
    title: "Pull Strength",
    category: "Strength",
    duration: "55 mins",
    difficulty: "Intermediate",
    calories: 400,
    muscles: ["Back", "Biceps", "Rear Delts"],
    description: "Build a massive back and strong pulling power.",
    exercises: [
      { name: "Deadlifts", sets: 3, reps: 5, rest: 180, icon: "💀" },
      { name: "Weighted Pull-ups", sets: 3, reps: 8, rest: 120, icon: "🆙" },
      { name: "Seated Cable Rows", sets: 3, reps: 12, rest: 90, icon: "🪑" },
      { name: "Barbell Curls", sets: 3, reps: 10, rest: 60, icon: "💪" },
    ],
  },
  {
    slug: "leg-day-intensity",
    title: "Leg Day Intensity",
    category: "Hypertrophy",
    duration: "70 mins",
    difficulty: "Advanced",
    calories: 600,
    muscles: ["Quads", "Hamstrings", "Glutes", "Calves"],
    description: "High volume lower body training for maximum growth.",
    exercises: [
      { name: "Back Squats", sets: 5, reps: 5, rest: 150, icon: "🦵" },
      { name: "Romanian Deadlifts", sets: 4, reps: 10, rest: 120, icon: "🇷🇴" },
      { name: "Leg Press", sets: 3, reps: 15, rest: 90, icon: "🚜" },
      { name: "Bulgarian Split Squats", sets: 3, reps: 12, rest: 90, icon: "🇧🇬" },
      { name: "Calf Raises", sets: 4, reps: 20, rest: 60, icon: "🦶" },
    ],
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("Clearing existing plans...");
    await WorkoutPlan.deleteMany({});

    console.log(`Inserting ${plans.length} plans...`);
    await WorkoutPlan.insertMany(plans);

    console.log("Workout plans seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
}

seed();
