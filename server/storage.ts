import {
  users,
  bars,
  reviews,
  checkIns,
  favorites,
  barPhotos,
  achievements,
  userAchievements,
  type User,
  type UpsertUser,
  type Bar,
  type InsertBar,
  type Review,
  type InsertReview,
  type CheckIn,
  type InsertCheckIn,
  type Favorite,
  type BarPhoto,
  type InsertBarPhoto,
  type Achievement,
  type UserAchievement,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, asc, count, avg } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Bar operations
  getBars(limit?: number): Promise<Bar[]>;
  getBar(id: string): Promise<Bar | undefined>;
  getBarBySlug(slug: string): Promise<Bar | undefined>;
  getNearbyBars(latitude: number, longitude: number, radiusKm?: number): Promise<Bar[]>;
  searchBars(query: string): Promise<Bar[]>;
  createBar(bar: InsertBar): Promise<Bar>;
  updateBar(id: string, updates: Partial<InsertBar>): Promise<Bar | undefined>;
  
  // Review operations
  getBarReviews(barId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateBarRating(barId: string): Promise<void>;
  
  // Check-in operations
  getUserCheckIns(userId: string): Promise<CheckIn[]>;
  getBarCheckIns(barId: string): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  
  // Favorite operations
  getUserFavorites(userId: string): Promise<Favorite[]>;
  isFavorite(userId: string, barId: string): Promise<boolean>;
  addFavorite(userId: string, barId: string): Promise<Favorite>;
  removeFavorite(userId: string, barId: string): Promise<void>;
  
  // Photo operations
  getBarPhotos(barId: string): Promise<BarPhoto[]>;
  createBarPhoto(photo: InsertBarPhoto): Promise<BarPhoto>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  checkAndAwardAchievements(userId: string): Promise<UserAchievement[]>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    visitedBars: number;
    totalCheckIns: number;
    totalReviews: number;
    totalPoints: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Bar operations
  async getBars(limit = 50): Promise<Bar[]> {
    return await db
      .select()
      .from(bars)
      .orderBy(desc(bars.averageRating), desc(bars.reviewCount))
      .limit(limit);
  }

  async getBar(id: string): Promise<Bar | undefined> {
    const [bar] = await db.select().from(bars).where(eq(bars.id, id));
    return bar;
  }

  async getBarBySlug(slug: string): Promise<Bar | undefined> {
    const [bar] = await db.select().from(bars).where(eq(bars.slug, slug));
    return bar;
  }

  async getNearbyBars(latitude: number, longitude: number, radiusKm = 25): Promise<Bar[]> {
    // Using PostGIS ST_DWithin for spatial queries
    return await db
      .select()
      .from(bars)
      .where(
        sql`ST_DWithin(
          geom, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusKm * 1000}
        )`
      )
      .orderBy(
        sql`ST_Distance(
          geom, 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        )`
      );
  }

  async searchBars(query: string): Promise<Bar[]> {
    return await db
      .select()
      .from(bars)
      .where(
        sql`to_tsvector('english', ${bars.name} || ' ' || ${bars.description} || ' ' || ${bars.city}) @@ plainto_tsquery('english', ${query})`
      )
      .orderBy(desc(bars.averageRating));
  }

  async createBar(barData: InsertBar): Promise<Bar> {
    const slug = barData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const [bar] = await db
      .insert(bars)
      .values({
        ...barData,
        slug,
        geom: sql`ST_SetSRID(ST_MakePoint(${barData.longitude}, ${barData.latitude}), 4326)`,
      })
      .returning();
    return bar;
  }

  async updateBar(id: string, updates: Partial<InsertBar>): Promise<Bar | undefined> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    
    if (updates.latitude && updates.longitude) {
      updateData.geom = sql`ST_SetSRID(ST_MakePoint(${updates.longitude}, ${updates.latitude}), 4326)`;
    }

    const [bar] = await db
      .update(bars)
      .set(updateData)
      .where(eq(bars.id, id))
      .returning();
    return bar;
  }

  // Review operations
  async getBarReviews(barId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.barId, barId))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    
    // Update bar rating
    await this.updateBarRating(reviewData.barId);
    
    return review;
  }

  async updateBarRating(barId: string): Promise<void> {
    const [result] = await db
      .select({
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.barId, barId));

    await db
      .update(bars)
      .set({
        averageRating: result.avgRating?.toString() || "0",
        reviewCount: Number(result.reviewCount) || 0,
        updatedAt: new Date(),
      })
      .where(eq(bars.id, barId));
  }

  // Check-in operations
  async getUserCheckIns(userId: string): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.createdAt));
  }

  async getBarCheckIns(barId: string): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.barId, barId))
      .orderBy(desc(checkIns.createdAt));
  }

  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    const [checkIn] = await db
      .insert(checkIns)
      .values({ ...checkInData, points: 10 })
      .returning();
    
    // Update user points
    await db
      .update(users)
      .set({
        points: sql`${users.points} + 10`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, checkInData.userId));
    
    // Check for new achievements
    await this.checkAndAwardAchievements(checkInData.userId);
    
    return checkIn;
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async isFavorite(userId: string, barId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.barId, barId)));
    return !!favorite;
  }

  async addFavorite(userId: string, barId: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, barId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, barId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.barId, barId)));
  }

  // Photo operations
  async getBarPhotos(barId: string): Promise<BarPhoto[]> {
    return await db
      .select()
      .from(barPhotos)
      .where(eq(barPhotos.barId, barId))
      .orderBy(desc(barPhotos.createdAt));
  }

  async createBarPhoto(photoData: InsertBarPhoto): Promise<BarPhoto> {
    const [photo] = await db
      .insert(barPhotos)
      .values(photoData)
      .returning();
    return photo;
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(asc(achievements.pointsRequired));
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));
  }

  async checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
    const stats = await this.getUserStats(userId);
    const allAchievements = await this.getAchievements();
    const userAchievements = await this.getUserAchievements(userId);
    const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    const newAchievements: UserAchievement[] = [];
    
    for (const achievement of allAchievements) {
      if (earnedAchievementIds.has(achievement.id)) continue;
      
      const qualifies = 
        stats.totalPoints >= (achievement.pointsRequired || 0) &&
        stats.visitedBars >= (achievement.barsRequired || 0);
      
      if (qualifies) {
        const [newAchievement] = await db
          .insert(userAchievements)
          .values({
            userId,
            achievementId: achievement.id,
          })
          .returning();
        newAchievements.push(newAchievement);
      }
    }
    
    return newAchievements;
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    visitedBars: number;
    totalCheckIns: number;
    totalReviews: number;
    totalPoints: number;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    const [checkInStats] = await db
      .select({
        visitedBars: sql<number>`COUNT(DISTINCT ${checkIns.barId})`,
        totalCheckIns: count(checkIns.id),
      })
      .from(checkIns)
      .where(eq(checkIns.userId, userId));
    
    const [reviewStats] = await db
      .select({
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.userId, userId));
    
    return {
      visitedBars: Number(checkInStats.visitedBars) || 0,
      totalCheckIns: Number(checkInStats.totalCheckIns) || 0,
      totalReviews: Number(reviewStats.totalReviews) || 0,
      totalPoints: user?.points || 0,
    };
  }
}

export const storage = new DatabaseStorage();
