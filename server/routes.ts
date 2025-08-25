import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBarSchema, insertReviewSchema, insertCheckInSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Bar routes
  app.get('/api/bars', async (req, res) => {
    try {
      const { lat, lng, radius, search } = req.query;
      
      let bars;
      if (search) {
        bars = await storage.searchBars(search as string);
      } else if (lat && lng) {
        bars = await storage.getNearbyBars(
          parseFloat(lat as string),
          parseFloat(lng as string),
          radius ? parseFloat(radius as string) : 25
        );
      } else {
        bars = await storage.getBars();
      }
      
      res.json(bars);
    } catch (error) {
      console.error("Error fetching bars:", error);
      res.status(500).json({ message: "Failed to fetch bars" });
    }
  });

  app.get('/api/bars/:id', async (req, res) => {
    try {
      const bar = await storage.getBar(req.params.id);
      if (!bar) {
        return res.status(404).json({ message: "Bar not found" });
      }
      res.json(bar);
    } catch (error) {
      console.error("Error fetching bar:", error);
      res.status(500).json({ message: "Failed to fetch bar" });
    }
  });

  app.post('/api/bars', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBarSchema.parse(req.body);
      const bar = await storage.createBar(validatedData);
      res.status(201).json(bar);
    } catch (error) {
      console.error("Error creating bar:", error);
      res.status(400).json({ message: "Invalid bar data" });
    }
  });

  // Review routes
  app.get('/api/bars/:barId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getBarReviews(req.params.barId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/bars/:barId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = {
        ...req.body,
        barId: req.params.barId,
        userId,
      };
      
      const validatedData = insertReviewSchema.parse(reviewData);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Check-in routes
  app.post('/api/bars/:barId/checkin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkInData = {
        ...req.body,
        barId: req.params.barId,
        userId,
      };
      
      const validatedData = insertCheckInSchema.parse(checkInData);
      const checkIn = await storage.createCheckIn(validatedData);
      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Error creating check-in:", error);
      res.status(400).json({ message: "Invalid check-in data" });
    }
  });

  app.get('/api/user/checkins', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkIns = await storage.getUserCheckIns(userId);
      res.json(checkIns);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  // Favorite routes
  app.get('/api/user/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/bars/:barId/favorite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const barId = req.params.barId;
      
      const isFav = await storage.isFavorite(userId, barId);
      if (isFav) {
        await storage.removeFavorite(userId, barId);
        res.json({ favorited: false });
      } else {
        await storage.addFavorite(userId, barId);
        res.json({ favorited: true });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  // Photo routes
  app.get('/api/bars/:barId/photos', async (req, res) => {
    try {
      const photos = await storage.getBarPhotos(req.params.barId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // User stats routes
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Achievement routes
  app.get('/api/user/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
