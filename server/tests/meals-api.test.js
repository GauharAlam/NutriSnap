import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, setupTestDB, teardownTestDB, clearTestDB, createTestUser } from "./helpers/test-server.js";

test.before(async () => {
  await setupTestDB("meals");
});

test.after(async () => {
  await teardownTestDB();
});

test.beforeEach(async () => {
  await clearTestDB();
});

test("POST /api/v1/meals logs a meal with expanded data", async () => {
  const { token } = await createTestUser();

  const payload = {
    title: "Post-workout Lunch",
    mealType: "lunch",
    eatenAt: new Date(),
    foodItems: [
      { name: "grilled chicken", portionMultiplier: 1.5, servingLabel: "150g", matchedFood: "grilled chicken" },
      { name: "rice", portionMultiplier: 1, servingLabel: "1 cup cooked", matchedFood: "rice" }
    ],
    nutrition: {
      calories: 535,
      protein: 56,
      carbs: 45,
      fats: 12.5,
      sugar: 0,
      fiber: 1,
      sodium: 115
    },
    source: "manual"
  };

  const response = await request(app)
    .post("/api/v1/meals")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  assert.equal(response.status, 201);
  assert.equal(response.body.data.nutrition.fiber, 1);
  assert.equal(response.body.data.nutrition.sodium, 115);
  assert.equal(response.body.data.foodItems.length, 2);
});

test("GET /api/v1/meals/templates returns curated meals", async () => {
  const { token } = await createTestUser();

  const response = await request(app)
    .get("/api/v1/meals/templates")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.ok(response.body.data.length > 0);
  assert.ok(response.body.data.some(t => t.dietType === "vegetarian"));
});

test("GET /api/v1/meals/templates?dietType=vegan filters results", async () => {
  const { token } = await createTestUser();

  const response = await request(app)
    .get("/api/v1/meals/templates?dietType=vegan")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.ok(response.body.data.every(t => t.dietType === "vegan" || t.dietType === "any"));
});
