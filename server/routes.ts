import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertGuestSchema, insertDishSchema, insertEventSchema } from "@shared/schema";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

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

  // Guest routes
  app.get('/api/guests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guests = await storage.getGuests(userId);
      res.json(guests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  app.get('/api/guests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guestId = parseInt(req.params.id);
      const guest = await storage.getGuest(guestId, userId);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      res.json(guest);
    } catch (error) {
      console.error("Error fetching guest:", error);
      res.status(500).json({ message: "Failed to fetch guest" });
    }
  });

  app.post('/api/guests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest({ ...guestData, userId });
      res.status(201).json(guest);
    } catch (error) {
      console.error("Error creating guest:", error);
      res.status(500).json({ message: "Failed to create guest" });
    }
  });

  app.put('/api/guests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guestId = parseInt(req.params.id);
      const guestData = insertGuestSchema.partial().parse(req.body);
      const guest = await storage.updateGuest(guestId, guestData, userId);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      res.json(guest);
    } catch (error) {
      console.error("Error updating guest:", error);
      res.status(500).json({ message: "Failed to update guest" });
    }
  });

  app.delete('/api/guests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guestId = parseInt(req.params.id);
      const deleted = await storage.deleteGuest(guestId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Guest not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting guest:", error);
      res.status(500).json({ message: "Failed to delete guest" });
    }
  });

  // Dish routes
  app.get('/api/dishes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dishes = await storage.getDishes(userId);
      res.json(dishes);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      res.status(500).json({ message: "Failed to fetch dishes" });
    }
  });

  app.get('/api/dishes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dishId = parseInt(req.params.id);
      const dish = await storage.getDish(dishId, userId);
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      console.error("Error fetching dish:", error);
      res.status(500).json({ message: "Failed to fetch dish" });
    }
  });

  app.post('/api/dishes', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dishData = insertDishSchema.parse({
        ...req.body,
        ingredients: req.body.ingredients ? JSON.parse(req.body.ingredients) : [],
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        pairsWith: req.body.pairsWith ? JSON.parse(req.body.pairsWith) : [],
        prepTime: req.body.prepTime ? parseInt(req.body.prepTime) : null,
        servings: req.body.servings ? parseInt(req.body.servings) : null,
      });
      
      if (req.file) {
        dishData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const dish = await storage.createDish({ ...dishData, userId });
      res.status(201).json(dish);
    } catch (error) {
      console.error("Error creating dish:", error);
      res.status(500).json({ message: "Failed to create dish" });
    }
  });

  app.put('/api/dishes/:id', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dishId = parseInt(req.params.id);
      const dishData = insertDishSchema.partial().parse({
        ...req.body,
        ingredients: req.body.ingredients ? JSON.parse(req.body.ingredients) : undefined,
        tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
        pairsWith: req.body.pairsWith ? JSON.parse(req.body.pairsWith) : undefined,
        prepTime: req.body.prepTime ? parseInt(req.body.prepTime) : undefined,
        servings: req.body.servings ? parseInt(req.body.servings) : undefined,
      });
      
      if (req.file) {
        dishData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const dish = await storage.updateDish(dishId, dishData, userId);
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      console.error("Error updating dish:", error);
      res.status(500).json({ message: "Failed to update dish" });
    }
  });

  app.delete('/api/dishes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dishId = parseInt(req.params.id);
      const deleted = await storage.deleteDish(dishId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Dish not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting dish:", error);
      res.status(500).json({ message: "Failed to delete dish" });
    }
  });

  // Event routes
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId, userId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { guestIds, dishIds, ...eventData } = req.body;
      const parsedEventData = insertEventSchema.parse(eventData);
      
      const event = await storage.createEvent({ ...parsedEventData, userId });
      
      // Add guests to event
      if (guestIds && guestIds.length > 0) {
        for (const guestId of guestIds) {
          await storage.addEventGuest(event.id, guestId);
        }
      }
      
      // Add dishes to event
      if (dishIds && dishIds.length > 0) {
        for (const dishId of dishIds) {
          await storage.addEventDish(event.id, dishId);
        }
      }
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(eventId, eventData, userId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      const deleted = await storage.deleteEvent(eventId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Analytics routes
  app.get('/api/guests/:id/meal-history', isAuthenticated, async (req: any, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const history = await storage.getGuestMealHistory(guestId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching meal history:", error);
      res.status(500).json({ message: "Failed to fetch meal history" });
    }
  });

  app.post('/api/repeat-dish-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { guestIds, dishIds } = req.body;
      const alerts = await storage.getRepeatDishAlerts(userId, guestIds, dishIds);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching repeat dish alerts:", error);
      res.status(500).json({ message: "Failed to fetch repeat dish alerts" });
    }
  });

  app.get('/api/dishes/:id/history', isAuthenticated, async (req: any, res) => {
    try {
      const dishId = parseInt(req.params.id);
      const history = await storage.getDishHistory(dishId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching dish history:", error);
      res.status(500).json({ message: "Failed to fetch dish history" });
    }
  });

  app.get('/api/recently-served', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const dishes = await storage.getRecentlyServedDishes(userId, limit);
      res.json(dishes);
    } catch (error) {
      console.error("Error fetching recently served dishes:", error);
      res.status(500).json({ message: "Failed to fetch recently served dishes" });
    }
  });

  // Event guests and dishes management
  app.post('/api/events/:id/guests', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { guestId } = req.body;
      const eventGuest = await storage.addEventGuest(eventId, guestId);
      res.status(201).json(eventGuest);
    } catch (error) {
      console.error("Error adding guest to event:", error);
      res.status(500).json({ message: "Failed to add guest to event" });
    }
  });

  app.delete('/api/events/:id/guests/:guestId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const guestId = parseInt(req.params.guestId);
      const deleted = await storage.removeEventGuest(eventId, guestId);
      if (!deleted) {
        return res.status(404).json({ message: "Guest not found in event" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing guest from event:", error);
      res.status(500).json({ message: "Failed to remove guest from event" });
    }
  });

  app.post('/api/events/:id/dishes', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { dishId } = req.body;
      const eventDish = await storage.addEventDish(eventId, dishId);
      res.status(201).json(eventDish);
    } catch (error) {
      console.error("Error adding dish to event:", error);
      res.status(500).json({ message: "Failed to add dish to event" });
    }
  });

  app.delete('/api/events/:id/dishes/:dishId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const dishId = parseInt(req.params.dishId);
      const deleted = await storage.removeEventDish(eventId, dishId);
      if (!deleted) {
        return res.status(404).json({ message: "Dish not found in event" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing dish from event:", error);
      res.status(500).json({ message: "Failed to remove dish from event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
