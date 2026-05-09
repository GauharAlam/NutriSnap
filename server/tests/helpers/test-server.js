import { app } from "../../src/app.js";
import mongoose from "mongoose";
import { User } from "../../src/models/user.model.js";
import { signAccessToken } from "../../src/utils/jwt.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Test Server Helper
 */

export async function setupTestDB(dbNameSuffix = "general") {
  const envUri = process.env.MONGODB_URI;
  let finalUri = process.env.MONGODB_URI_TEST;

  if (!finalUri && envUri) {
    // If using Atlas, try to inject the test database name
    if (envUri.includes(".mongodb.net/")) {
      const parts = envUri.split(".mongodb.net/");
      const afterDomain = parts[1];
      const dbNameMatch = afterDomain.match(/^([^?]+)/);
      const dbName = dbNameMatch ? dbNameMatch[1] : "test";
      const remaining = afterDomain.substring(dbName.length);
      finalUri = `${parts[0]}.mongodb.net/${dbName}_test_${dbNameSuffix}${remaining}`;
    } else {
      finalUri = `${envUri}_test_${dbNameSuffix}`;
    }
  }

  if (!finalUri) {
    finalUri = `mongodb://127.0.0.1:27017/nutrisnap_test_${dbNameSuffix}`;
  }
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(finalUri);
  }
}

export async function teardownTestDB() {
  if (mongoose.connection.readyState !== 0) {
    // Be careful with dropping database on Atlas if multiple tests share the same cluster
    // For safety in this environment, we just clear collections in beforeEach
    // but we can drop the specific test DB if we're sure.
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
      }
    } catch (e) {
      console.warn("Could not drop test database:", e.message);
    }
    await mongoose.connection.close();
  }
}

export async function clearTestDB() {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
}

export async function createTestUser(overrides = {}) {
  const user = await User.create({
    name: "Test User",
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: "hashed_password",
    goalType: "maintenance",
    ...overrides,
  });

  const token = signAccessToken(user);

  return { user, token };
}

export { app };
