import mongoose from "mongoose";
import dotenv from "dotenv";
import { Exercise } from "../models/exercise.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fitness_nutrition_app";

const exercises = [
  // ─── Chest ────────────────────────────────────────────────────────────
  { name: "Barbell Bench Press", category: "Chest", muscleGroups: ["chest", "triceps", "front_delts"], equipment: "barbell", icon: "🏋️" },
  { name: "Dumbbell Bench Press", category: "Chest", muscleGroups: ["chest", "triceps", "front_delts"], equipment: "dumbbell", icon: "💪" },
  { name: "Incline Barbell Press", category: "Chest", muscleGroups: ["upper_chest", "front_delts"], equipment: "barbell", icon: "📈" },
  { name: "Incline Dumbbell Press", category: "Chest", muscleGroups: ["upper_chest", "front_delts"], equipment: "dumbbell", icon: "🔥" },
  { name: "Decline Bench Press", category: "Chest", muscleGroups: ["lower_chest"], equipment: "barbell", icon: "📉" },
  { name: "Cable Flyes", category: "Chest", muscleGroups: ["chest"], equipment: "cable", icon: "🦋" },
  { name: "Dumbbell Flyes", category: "Chest", muscleGroups: ["chest"], equipment: "dumbbell", icon: "👐" },
  { name: "Chest Press Machine", category: "Chest", muscleGroups: ["chest"], equipment: "machine", icon: "🦾" },
  { name: "Push-ups", category: "Chest", muscleGroups: ["chest", "triceps"], equipment: "bodyweight", icon: "🤸" },

  // ─── Back ─────────────────────────────────────────────────────────────
  { name: "Deadlift", category: "Back", muscleGroups: ["lower_back", "hamstrings", "glutes", "traps"], equipment: "barbell", icon: "💀" },
  { name: "Pull-ups", category: "Back", muscleGroups: ["lats", "biceps"], equipment: "bodyweight", icon: "🆙" },
  { name: "Lat Pulldown", category: "Back", muscleGroups: ["lats", "biceps"], equipment: "cable", icon: "⬇️" },
  { name: "Bent Over Barbell Row", category: "Back", muscleGroups: ["mid_back", "lats", "biceps"], equipment: "barbell", icon: "🚣" },
  { name: "Seated Cable Row", category: "Back", muscleGroups: ["mid_back", "biceps"], equipment: "cable", icon: "🪑" },
  { name: "One Arm Dumbbell Row", category: "Back", muscleGroups: ["lats", "mid_back"], equipment: "dumbbell", icon: "💪" },
  { name: "T-Bar Row", category: "Back", muscleGroups: ["mid_back"], equipment: "barbell", icon: "⚓" },
  { name: "Face Pulls", category: "Back", muscleGroups: ["rear_delts", "traps"], equipment: "cable", icon: "👺" },
  { name: "Back Extensions", category: "Back", muscleGroups: ["lower_back"], equipment: "none", icon: "🧘" },

  // ─── Shoulders ────────────────────────────────────────────────────────
  { name: "Overhead Press", category: "Shoulders", muscleGroups: ["front_delts", "mid_delts", "triceps"], equipment: "barbell", icon: "⬆️" },
  { name: "Dumbbell Shoulder Press", category: "Shoulders", muscleGroups: ["front_delts", "mid_delts"], equipment: "dumbbell", icon: "💪" },
  { name: "Lateral Raises", category: "Shoulders", muscleGroups: ["mid_delts"], equipment: "dumbbell", icon: "👐" },
  { name: "Front Raises", category: "Shoulders", muscleGroups: ["front_delts"], equipment: "dumbbell", icon: "🙋" },
  { name: "Reverse Flyes", category: "Shoulders", muscleGroups: ["rear_delts"], equipment: "dumbbell", icon: "🦅" },
  { name: "Arnold Press", category: "Shoulders", muscleGroups: ["front_delts", "mid_delts"], equipment: "dumbbell", icon: "🦾" },
  { name: "Upright Row", category: "Shoulders", muscleGroups: ["traps", "delts"], equipment: "barbell", icon: "⏫" },
  { name: "Shrugs", category: "Shoulders", muscleGroups: ["traps"], equipment: "dumbbell", icon: "🤷" },

  // ─── Legs ─────────────────────────────────────────────────────────────
  { name: "Back Squat", category: "Legs", muscleGroups: ["quads", "glutes", "hamstrings"], equipment: "barbell", icon: "🦵" },
  { name: "Front Squat", category: "Legs", muscleGroups: ["quads", "core"], equipment: "barbell", icon: "🛡️" },
  { name: "Leg Press", category: "Legs", muscleGroups: ["quads", "glutes"], equipment: "machine", icon: "🚜" },
  { name: "Lunges", category: "Legs", muscleGroups: ["quads", "glutes", "hamstrings"], equipment: "dumbbell", icon: "🚶" },
  { name: "Romanian Deadlift", category: "Legs", muscleGroups: ["hamstrings", "glutes"], equipment: "barbell", icon: "🇷🇴" },
  { name: "Leg Extensions", category: "Legs", muscleGroups: ["quads"], equipment: "machine", icon: "🦵" },
  { name: "Leg Curls", category: "Legs", muscleGroups: ["hamstrings"], equipment: "machine", icon: "➰" },
  { name: "Calf Raises", category: "Legs", muscleGroups: ["calves"], equipment: "machine", icon: "🦶" },
  { name: "Bulgarian Split Squat", category: "Legs", muscleGroups: ["quads", "glutes"], equipment: "dumbbell", icon: "🇧🇬" },
  { name: "Goblet Squat", category: "Legs", muscleGroups: ["quads", "core"], equipment: "kettlebell", icon: "🏆" },

  // ─── Biceps ───────────────────────────────────────────────────────────
  { name: "Barbell Curl", category: "Biceps", muscleGroups: ["biceps"], equipment: "barbell", icon: "💪" },
  { name: "Dumbbell Curl", category: "Biceps", muscleGroups: ["biceps"], equipment: "dumbbell", icon: "🤳" },
  { name: "Hammer Curl", category: "Biceps", muscleGroups: ["biceps", "forearms"], equipment: "dumbbell", icon: "🔨" },
  { name: "Preacher Curl", category: "Biceps", muscleGroups: ["biceps"], equipment: "ez_bar", icon: "⛪" },
  { name: "Concentration Curl", category: "Biceps", muscleGroups: ["biceps"], equipment: "dumbbell", icon: "🎯" },
  { name: "Cable Curl", category: "Biceps", muscleGroups: ["biceps"], equipment: "cable", icon: "➰" },

  // ─── Triceps ──────────────────────────────────────────────────────────
  { name: "Tricep Pushdown", category: "Triceps", muscleGroups: ["triceps"], equipment: "cable", icon: "⬇️" },
  { name: "Skull Crushers", category: "Triceps", muscleGroups: ["triceps"], equipment: "ez_bar", icon: "💀" },
  { name: "Overhead Tricep Extension", category: "Triceps", muscleGroups: ["triceps"], equipment: "dumbbell", icon: "⬆️" },
  { name: "Dips", category: "Triceps", muscleGroups: ["triceps", "chest"], equipment: "bodyweight", icon: "📉" },
  { name: "Close Grip Bench Press", category: "Triceps", muscleGroups: ["triceps", "chest"], equipment: "barbell", icon: "👐" },
  { name: "Tricep Kickbacks", category: "Triceps", muscleGroups: ["triceps"], equipment: "dumbbell", icon: "🔙" },

  // ─── Core ─────────────────────────────────────────────────────────────
  { name: "Plank", category: "Core", muscleGroups: ["abs", "lower_back"], equipment: "none", icon: "🪵" },
  { name: "Crunches", category: "Core", muscleGroups: ["abs"], equipment: "none", icon: "🐢" },
  { name: "Leg Raises", category: "Core", muscleGroups: ["lower_abs"], equipment: "none", icon: "🆙" },
  { name: "Russian Twists", category: "Core", muscleGroups: ["obliques"], equipment: "none", icon: "🇷🇺" },
  { name: "Hanging Leg Raises", category: "Core", muscleGroups: ["abs"], equipment: "none", icon: "🐒" },
  { name: "Bicycle Crunches", category: "Core", muscleGroups: ["abs", "obliques"], equipment: "none", icon: "🚲" },

  // ─── Cardio ───────────────────────────────────────────────────────────
  { name: "Running", category: "Cardio", muscleGroups: ["full_body"], equipment: "none", icon: "🏃" },
  { name: "Cycling", category: "Cardio", muscleGroups: ["legs"], equipment: "none", icon: "🚴" },
  { name: "Swimming", category: "Cardio", muscleGroups: ["full_body"], equipment: "none", icon: "🏊" },
  { name: "Jump Rope", category: "Cardio", muscleGroups: ["full_body"], equipment: "none", icon: "➰" },
  { name: "Burpees", category: "Cardio", muscleGroups: ["full_body"], equipment: "none", icon: "💥" },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("Clearing existing exercises...");
    await Exercise.deleteMany({ isCustom: false });

    console.log(`Inserting ${exercises.length} exercises...`);
    await Exercise.insertMany(exercises);

    console.log("Exercises seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding exercises:", error);
    process.exit(1);
  }
}

seed();
