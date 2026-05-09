import test from "node:test";
import assert from "node:assert/strict";
import { runDailyCoachJob } from "../src/jobs/daily-coach.job.js";
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser } from "./helpers/test-server.js";
import { Meal } from "../src/models/meal.model.js";

test.before(async () => {
  await setupTestDB("coach");
});

test.after(async () => {
  await teardownTestDB();
});

test.beforeEach(async () => {
  await clearTestDB();
});

test("runDailyCoachJob completes without crashing even with no users", async () => {
  // Should not throw
  await runDailyCoachJob();
  assert.ok(true);
});

test("runDailyCoachJob processes a user with yesterday's data", async () => {
  const { user } = await createTestUser({
    expoPushToken: "ExponentPushToken[test]",
    profile: { weightKg: 80, trainingGoal: "muscle_gain" }
  });

  // Create a meal for yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  await Meal.create({
    userId: user._id,
    title: "Yesterday Dinner",
    mealType: "dinner",
    eatenAt: yesterday,
    nutrition: { calories: 800, protein: 50, carbs: 60, fats: 20, sugar: 5, fiber: 5, sodium: 500 }
  });

  // This would normally call the AI and Expo SDK.
  // We're verifying the logic flow (fetching dashboard, etc) doesn't crash.
  // In a full test we'd mock the notification service and AI service.
  try {
    await runDailyCoachJob();
    assert.ok(true);
  } catch (error) {
    assert.fail(`Job crashed: ${error.message}`);
  }
});
