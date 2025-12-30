import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { hashPassword, comparePassword } from "./_core/password";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Auth functions
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function registerUser(email: string, password: string, name: string, role: "user" | "admin" = "user") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate a unique openId for email-based users
  const openId = `email-${email}-${Date.now()}`;

  try {
    const hashedPassword = await hashPassword(password);
    
    const result = await db.insert(users).values({
      openId,
      email,
      name,
      passwordHash: hashedPassword,
      loginMethod: 'email',
      role,
      lastSignedIn: new Date(),
    });

    // Fetch and return the created user
    return getUserByEmail(email);
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

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}
