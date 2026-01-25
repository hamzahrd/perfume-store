import mongoose from "mongoose";
import { User, IUser } from "./models/User";
import { ENV } from './_core/env';
import { hashPassword, comparePassword } from "./_core/password";

let isConnected = false;

export async function getDb() {
  if (isConnected) {
    return true;
  }

  if (!process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL not set");
    return false;
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    isConnected = true;
    console.log("[Database] Connected to MongoDB");
    return true;
  } catch (error) {
    console.warn("[Database] Failed to connect to MongoDB:", error);
    isConnected = false;
    return false;
  }
}

// Auth functions
export async function getUserByEmail(email: string) {
  const connected = await getDb();
  if (!connected) return undefined;

  try {
    const user = await User.findOne({ email }).lean();
    return user ? user : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by email:", error);
    return undefined;
  }
}

export async function registerUser(email: string, password: string, name: string, role: "user" | "admin" = "user") {
  const connected = await getDb();
  if (!connected) throw new Error("Database not available");

  // Generate a unique openId for email-based users
  const openId = `email-${email}-${Date.now()}`;

  try {
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      openId,
      email,
      name,
      passwordHash: hashedPassword,
      loginMethod: 'email',
      role,
      lastSignedIn: new Date(),
    });

    // Fetch and return the created user
    return await getUserByEmail(email);
  } catch (error) {
    console.error("[Database] Failed to register user:", error);
    throw error;
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user || !user.passwordHash) {
    return null; // User not found or doesn't have password auth
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    return null; // Invalid password
  }

  return user;
}

export async function updateUserLastSignedIn(userId: string | number) {
  const connected = await getDb();
  if (!connected) return;

  try {
    await User.findByIdAndUpdate(userId, { lastSignedIn: new Date() });
  } catch (error) {
    console.error("[Database] Failed to update user last signed in:", error);
  }
}
