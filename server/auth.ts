import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { SignupData, LoginData, signupSchema, loginSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "kava-krawler-dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && (req.session as any).userId) {
    req.user = {
      id: (req.session as any).userId,
      email: (req.session as any).userEmail,
    };
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signup(signupData: SignupData) {
  const validatedData = signupSchema.parse(signupData);
  
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(validatedData.email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);

  // Create user
  const user = await storage.createUser({
    email: validatedData.email,
    password: hashedPassword,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
  });

  return { id: user.id, email: user.email };
}

export async function login(loginData: LoginData) {
  const validatedData = loginSchema.parse(loginData);
  
  // Get user by email
  const user = await storage.getUserByEmail(validatedData.email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Verify password
  const isValid = await verifyPassword(validatedData.password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return { id: user.id, email: user.email };
}