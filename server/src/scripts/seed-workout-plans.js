import mongoose from "mongoose";
import dotenv from "dotenv";
import { WorkoutPlan } from "../models/workout-plan.model.js";

// Load environment variables manually since this is a standalone script
dotenv.config({ path: ".env" });

const workoutPlans = [
  {
    slug: "chest-blast",
    title: "Chest & Triceps Blast",
    category: "Muscle Gain",
    duration: "45 min",
    difficulty: "Intermediate",
    calories: 380,
    muscles: ["Chest", "Triceps", "Shoulders"],
    description: "A powerful chest and triceps session designed to maximize hypertrophy through compound and isolation movements. Perfect for intermediate lifters looking to build upper body mass.",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: 12, rest: 90, icon: "🏋️", instructions: ["Lie flat on the bench with feet firmly on the ground", "Grip the bar slightly wider than shoulder width", "Lower the bar to mid-chest level", "Press up explosively to lockout"] },
      { name: "Incline Dumbbell Press", sets: 3, reps: 12, rest: 75, icon: "🔥", instructions: ["Set bench to 30-45 degree angle", "Press dumbbells from shoulder level", "Squeeze at the top for maximum contraction", "Lower slowly for 3-second eccentric"] },
      { name: "Cable Flyes", sets: 3, reps: 15, rest: 60, icon: "💪", instructions: ["Set cables at shoulder height", "Bring handles together in a hugging motion", "Hold the squeeze for 1 second", "Return slowly to starting position"] },
      { name: "Tricep Rope Pushdown", sets: 3, reps: 15, rest: 60, icon: "⚡", instructions: ["Attach rope to high pulley", "Keep elbows pinned to your sides", "Push down and spread the rope at bottom", "Control the weight on the way up"] },
      { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: 60, icon: "🎯", instructions: ["Hold dumbbell overhead with both hands", "Lower behind head keeping elbows pointed up", "Extend arms back to starting position", "Keep core tight throughout"] },
      { name: "Push-ups to Failure", sets: 2, reps: 0, rest: 45, icon: "🔥", instructions: ["Standard push-up position", "Lower chest to the ground", "Push up explosively", "Continue until failure"] },
    ],
  },
  {
    slug: "hiit-fat-burn",
    title: "HIIT Fat Burner",
    category: "Fat Loss",
    duration: "30 min",
    difficulty: "Advanced",
    calories: 450,
    muscles: ["Full Body"],
    description: "An intense HIIT circuit designed to maximize calorie burn and boost metabolism. 30 seconds work, 15 seconds rest format.",
    exercises: [
      { name: "Burpees", sets: 4, reps: 15, rest: 30, icon: "💥", instructions: ["Start standing", "Drop to a push-up", "Jump back up explosively", "Raise arms overhead"] },
      { name: "Mountain Climbers", sets: 4, reps: 30, rest: 20, icon: "🏔️", instructions: ["Start in plank position", "Drive knees to chest alternately", "Keep hips level", "Maintain fast pace"] },
      { name: "Jump Squats", sets: 4, reps: 20, rest: 30, icon: "🦘", instructions: ["Squat down to parallel", "Jump explosively", "Land softly", "Immediately go into next rep"] },
      { name: "High Knees", sets: 3, reps: 30, rest: 20, icon: "🏃", instructions: ["Stand tall", "Run in place", "Drive knees high", "Pump arms"] },
    ],
  },
  {
    slug: "full-body-strength",
    title: "Full Body Strength",
    category: "Strength",
    duration: "60 min",
    difficulty: "Advanced",
    calories: 520,
    muscles: ["Full Body"],
    description: "A comprehensive full-body workout targeting all major muscle groups with compound movements.",
    exercises: [
      { name: "Deadlifts", sets: 4, reps: 8, rest: 120, icon: "🏋️", instructions: ["Stand with feet hip-width", "Grip bar outside knees", "Drive through heels", "Lock out hips at top"] },
      { name: "Squats", sets: 4, reps: 10, rest: 90, icon: "🦵", instructions: ["Bar on upper back", "Squat to parallel or below", "Keep chest up", "Drive up through heels"] },
      { name: "Overhead Press", sets: 3, reps: 10, rest: 75, icon: "💪", instructions: ["Bar at shoulder height", "Press overhead", "Lock out arms", "Lower under control"] },
      { name: "Bent Over Rows", sets: 3, reps: 12, rest: 60, icon: "🎯", instructions: ["Hinge at hips", "Pull bar to lower chest", "Squeeze shoulder blades", "Lower slowly"] },
    ],
  },
  {
    slug: "morning-yoga",
    title: "Morning Flow Yoga",
    category: "Yoga",
    duration: "25 min",
    difficulty: "Beginner",
    calories: 150,
    muscles: ["Core", "Flexibility"],
    description: "A gentle morning flow to awaken the body and mind.",
    exercises: [
      { name: "Sun Salutations", sets: 4, reps: 5, rest: 30, icon: "🌞", instructions: ["Move with breath", "Flow smoothly"] },
      { name: "Downward Dog", sets: 3, reps: 1, rest: 30, icon: "🐕", instructions: ["Hold for 30 seconds", "Press heels down"] },
    ]
  },
  {
    slug: "cardio-endurance",
    title: "Cardio Endurance",
    category: "Cardio",
    duration: "40 min",
    difficulty: "Intermediate",
    calories: 400,
    muscles: ["Legs", "Cardio"],
    description: "Continuous steady state cardio for heart health.",
    exercises: [
      { name: "Jogging", sets: 1, reps: 0, rest: 0, icon: "🏃", instructions: ["Maintain steady 70% heart rate zone"] },
    ]
  },
  {
    slug: "leg-day",
    title: "Ultimate Leg Day",
    category: "Strength",
    duration: "50 min",
    difficulty: "Advanced",
    calories: 480,
    muscles: ["Quads", "Hamstrings", "Glutes"],
    description: "Heavy lifting leg day.",
    exercises: [
      { name: "Barbell Squats", sets: 5, reps: 8, rest: 120, icon: "🦵", instructions: ["Squat below parallel", "Explode up"] },
      { name: "Romanian Deadlifts", sets: 4, reps: 10, rest: 90, icon: "🏋️", instructions: ["Hinge at hips", "Feel hamstring stretch"] },
    ]
  }
];

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fitness_nutrition_app";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    
    console.log("Clearing existing workout plans...");
    await WorkoutPlan.deleteMany({});
    
    console.log("Inserting new workout plans...");
    await WorkoutPlan.insertMany(workoutPlans);
    
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
