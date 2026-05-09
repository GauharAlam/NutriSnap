import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, setupTestDB, teardownTestDB, clearTestDB } from "./helpers/test-server.js";

test.before(async () => {
  await setupTestDB("auth");
});

test.after(async () => {
  await teardownTestDB();
});

test.beforeEach(async () => {
  await clearTestDB();
});

test("POST /api/v1/auth/register creates a new user", async () => {
  const payload = {
    name: "New User",
    email: "newuser@example.com",
    password: "Password123!",
  };

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send(payload);

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.email, "newuser@example.com");
  assert.ok(response.body.data.accessToken);
});

test("POST /api/v1/auth/register with profile data", async () => {
  const payload = {
    name: "Profile User",
    email: "profile@example.com",
    password: "Password123!",
    profile: {
      age: 25,
      gender: "male",
      weightKg: 75,
      heightCm: 180,
      trainingGoal: "muscle_gain"
    }
  };

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send(payload);

  assert.equal(response.status, 201);
  assert.equal(response.body.data.user.goalType, "muscle_gain");
  assert.equal(response.body.data.user.profile.age, 25);
});

test("POST /api/v1/auth/login with valid credentials", async () => {
  // Register first
  await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "Login User", email: "login@example.com", password: "Password123!" });

  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "login@example.com", password: "Password123!" });

  assert.equal(response.status, 200);
  assert.ok(response.body.data.accessToken);
});

test("POST /api/v1/auth/login with invalid credentials", async () => {
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "wrong@example.com", password: "wrong-password-long-enough" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
