import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, setupTestDB, teardownTestDB, clearTestDB, createTestUser } from "./helpers/test-server.js";

test.before(async () => {
  await setupTestDB("goals");
});

test.after(async () => {
  await teardownTestDB();
});

test.beforeEach(async () => {
  await clearTestDB();
});

test("GET /api/v1/goals returns draft goal for new user", async () => {
  const { token } = await createTestUser();

  const response = await request(app)
    .get("/api/v1/goals")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.isDraft, true);
  assert.ok(response.body.data.dailyTargets.calories > 0);
});

test("GET /api/v1/goals uses TDEE for user with profile", async () => {
  const { token } = await createTestUser({
    profile: { age: 25, gender: "male", weightKg: 80, heightCm: 180, activityLevel: "active" }
  });

  const response = await request(app)
    .get("/api/v1/goals")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.targetSource, "tdee");
  // Active TDEE for 80kg male should be high
  assert.ok(response.body.data.dailyTargets.calories > 2500);
});

test("POST /api/v1/goals saves a goal", async () => {
  const { token } = await createTestUser();

  const payload = {
    goalType: "muscle_gain",
    weeklyWorkoutDays: 5,
    currentWeight: 70,
    targetWeight: 75
  };

  const response = await request(app)
    .post("/api/v1/goals")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.goalType, "muscle_gain");
  assert.equal(response.body.data.isDraft, false);
});
