import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, setupTestDB, teardownTestDB, clearTestDB, createTestUser } from "./helpers/test-server.js";

test.before(async () => {
  await setupTestDB("workouts");
});

test.after(async () => {
  await teardownTestDB();
});

test.beforeEach(async () => {
  await clearTestDB();
});

test("POST /api/v1/workouts logs a complex workout with PR detection", async () => {
  const { token } = await createTestUser();

  // Use fixed dates to avoid timezone/range issues
  const date1 = new Date("2026-05-05T10:00:00Z");
  const date2 = new Date("2026-05-07T10:00:00Z");

  // First workout — set initial baseline
  await request(app)
    .post("/api/v1/workouts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Chest Day 1",
      category: "Strength",
      durationMinutes: 45,
      caloriesBurned: 300,
      completedAt: date1,
      exercises: [
        {
          exerciseName: "Bench Press",
          muscleGroups: ["chest"],
          sets: [{ setNumber: 1, reps: 10, weightKg: 60 }]
        }
      ]
    });

  // Second workout — beat the baseline
  const response = await request(app)
    .post("/api/v1/workouts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Chest Day 2",
      category: "Strength",
      durationMinutes: 45,
      caloriesBurned: 300,
      completedAt: date2,
      exercises: [
        {
          exerciseName: "Bench Press",
          muscleGroups: ["chest"],
          sets: [{ setNumber: 1, reps: 10, weightKg: 70 }] // Weight PR
        }
      ]
    });

  assert.equal(response.status, 201);
  assert.ok(response.body.prs.length > 0);
  assert.equal(response.body.prs[0].exerciseName, "Bench Press");
  assert.equal(response.body.prs[0].type, "weight");
});

test("GET /api/v1/workouts/analytics returns volume distribution", async () => {
  const { token } = await createTestUser();
  const testDate = new Date("2026-05-06T10:00:00Z"); // A Wednesday

  // Log a workout with exercises
  await request(app)
    .post("/api/v1/workouts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Full Body",
      category: "Strength",
      durationMinutes: 60,
      caloriesBurned: 400,
      completedAt: testDate,
      exercises: [
        {
          exerciseName: "Squats",
          muscleGroups: ["quads", "glutes"],
          sets: [{ setNumber: 1, reps: 10, weightKg: 80 }]
        }
      ]
    });

  // Query for the week of May 4th (Monday)
  const response = await request(app)
    .get("/api/v1/workouts/analytics?weekStart=2026-05-04")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.weeklySummary.volumeByMuscle.quads, 1);
  assert.equal(response.body.data.weeklySummary.volumeByMuscle.glutes, 1);
  assert.ok(response.body.data.weeklySummary.missedMuscleGroups.includes("chest"));
});
