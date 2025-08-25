import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  uuid,
  geometry
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  points: integer("points").default(0),
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bars table with PostGIS support
export const bars = pgTable("bars", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  geom: geometry("geom", { type: "point", mode: "xy", srid: 4326 }),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  phone: text("phone"),
  website: text("website"),
  description: text("description"),
  hours: jsonb("hours").$type<Record<string, { open: string; close: string; closed?: boolean }>>(),
  offersKava: boolean("offers_kava").default(false),
  offersKratom: boolean("offers_kratom").default(false),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  vibe: text("vibe"),
  isVerified: boolean("is_verified").default(false),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bar photos table
export const barPhotos = pgTable("bar_photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  barId: uuid("bar_id").notNull().references(() => bars.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  barId: uuid("bar_id").notNull().references(() => bars.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 shells
  comment: text("comment"),
  photoUrl: text("photo_url"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Check-ins table
export const checkIns = pgTable("check_ins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  barId: uuid("bar_id").notNull().references(() => bars.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  note: text("note"),
  photoUrl: text("photo_url"),
  points: integer("points").default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  barId: uuid("bar_id").notNull().references(() => bars.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  pointsRequired: integer("points_required").default(0),
  barsRequired: integer("bars_required").default(0),
  isActive: boolean("is_active").default(true),
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  checkIns: many(checkIns),
  favorites: many(favorites),
  barPhotos: many(barPhotos),
  userAchievements: many(userAchievements),
}));

export const barsRelations = relations(bars, ({ many }) => ({
  reviews: many(reviews),
  checkIns: many(checkIns),
  favorites: many(favorites),
  photos: many(barPhotos),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  bar: one(bars, {
    fields: [reviews.barId],
    references: [bars.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  bar: one(bars, {
    fields: [checkIns.barId],
    references: [bars.id],
  }),
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  bar: one(bars, {
    fields: [favorites.barId],
    references: [bars.id],
  }),
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

export const barPhotosRelations = relations(barPhotos, ({ one }) => ({
  bar: one(bars, {
    fields: [barPhotos.barId],
    references: [bars.id],
  }),
  user: one(users, {
    fields: [barPhotos.userId],
    references: [users.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

// Insert schemas
export const insertBarSchema = createInsertSchema(bars).omit({
  id: true,
  geom: true,
  averageRating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  points: true,
  createdAt: true,
});

export const insertBarPhotoSchema = createInsertSchema(barPhotos).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Bar = typeof bars.$inferSelect;
export type InsertBar = z.infer<typeof insertBarSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type BarPhoto = typeof barPhotos.$inferSelect;
export type InsertBarPhoto = z.infer<typeof insertBarPhotoSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
