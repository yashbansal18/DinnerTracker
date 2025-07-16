import {
  users,
  guests,
  dishes,
  events,
  eventGuests,
  eventDishes,
  guestDishFavorites,
  type User,
  type UpsertUser,
  type Guest,
  type InsertGuest,
  type Dish,
  type InsertDish,
  type Event,
  type InsertEvent,
  type EventGuest,
  type EventDish,
  type GuestDishFavorite,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Guest operations
  getGuests(userId: string): Promise<Guest[]>;
  getGuest(id: number, userId: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest & { userId: string }): Promise<Guest>;
  updateGuest(id: number, guest: Partial<InsertGuest>, userId: string): Promise<Guest | undefined>;
  deleteGuest(id: number, userId: string): Promise<boolean>;

  // Dish operations
  getDishes(userId: string): Promise<Dish[]>;
  getDish(id: number, userId: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish & { userId: string }): Promise<Dish>;
  updateDish(id: number, dish: Partial<InsertDish>, userId: string): Promise<Dish | undefined>;
  deleteDish(id: number, userId: string): Promise<boolean>;

  // Event operations
  getEvents(userId: string): Promise<Event[]>;
  getEvent(id: number, userId: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent & { userId: string }): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>, userId: string): Promise<Event | undefined>;
  deleteEvent(id: number, userId: string): Promise<boolean>;

  // Event-Guest operations
  getEventGuests(eventId: number): Promise<EventGuest[]>;
  addEventGuest(eventId: number, guestId: number): Promise<EventGuest>;
  removeEventGuest(eventId: number, guestId: number): Promise<boolean>;

  // Event-Dish operations
  getEventDishes(eventId: number): Promise<EventDish[]>;
  addEventDish(eventId: number, dishId: number): Promise<EventDish>;
  removeEventDish(eventId: number, dishId: number): Promise<boolean>;

  // Guest-Dish favorite operations
  getGuestDishFavorites(guestId: number): Promise<GuestDishFavorite[]>;
  addGuestDishFavorite(guestId: number, dishId: number): Promise<GuestDishFavorite>;
  removeGuestDishFavorite(guestId: number, dishId: number): Promise<boolean>;

  // Analytics and smart suggestions
  getGuestMealHistory(guestId: number): Promise<any[]>;
  getRepeatDishAlerts(userId: string, guestIds: number[], dishIds: number[]): Promise<any[]>;
  getDishHistory(dishId: number): Promise<any[]>;
  getRecentlyServedDishes(userId: string, limit?: number): Promise<any[]>;
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

  // Guest operations
  async getGuests(userId: string): Promise<Guest[]> {
    return await db
      .select()
      .from(guests)
      .where(eq(guests.userId, userId))
      .orderBy(asc(guests.name));
  }

  async getGuest(id: number, userId: string): Promise<Guest | undefined> {
    const [guest] = await db
      .select()
      .from(guests)
      .where(and(eq(guests.id, id), eq(guests.userId, userId)));
    return guest;
  }

  async createGuest(guest: InsertGuest & { userId: string }): Promise<Guest> {
    const [newGuest] = await db.insert(guests).values(guest).returning();
    return newGuest;
  }

  async updateGuest(id: number, guest: Partial<InsertGuest>, userId: string): Promise<Guest | undefined> {
    const [updatedGuest] = await db
      .update(guests)
      .set({ ...guest, updatedAt: new Date() })
      .where(and(eq(guests.id, id), eq(guests.userId, userId)))
      .returning();
    return updatedGuest;
  }

  async deleteGuest(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(guests)
      .where(and(eq(guests.id, id), eq(guests.userId, userId)));
    return result.rowCount > 0;
  }

  // Dish operations
  async getDishes(userId: string): Promise<Dish[]> {
    return await db
      .select()
      .from(dishes)
      .where(eq(dishes.userId, userId))
      .orderBy(asc(dishes.title));
  }

  async getDish(id: number, userId: string): Promise<Dish | undefined> {
    const [dish] = await db
      .select()
      .from(dishes)
      .where(and(eq(dishes.id, id), eq(dishes.userId, userId)));
    return dish;
  }

  async createDish(dish: InsertDish & { userId: string }): Promise<Dish> {
    const [newDish] = await db.insert(dishes).values(dish).returning();
    return newDish;
  }

  async updateDish(id: number, dish: Partial<InsertDish>, userId: string): Promise<Dish | undefined> {
    const [updatedDish] = await db
      .update(dishes)
      .set({ ...dish, updatedAt: new Date() })
      .where(and(eq(dishes.id, id), eq(dishes.userId, userId)))
      .returning();
    return updatedDish;
  }

  async deleteDish(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(dishes)
      .where(and(eq(dishes.id, id), eq(dishes.userId, userId)));
    return result.rowCount > 0;
  }

  // Event operations
  async getEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.date));
  }

  async getEvent(id: number, userId: string): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)));
    return event;
  }

  async createEvent(event: InsertEvent & { userId: string }): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>, userId: string): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)));
    return result.rowCount > 0;
  }

  // Event-Guest operations
  async getEventGuests(eventId: number): Promise<EventGuest[]> {
    return await db
      .select()
      .from(eventGuests)
      .where(eq(eventGuests.eventId, eventId));
  }

  async addEventGuest(eventId: number, guestId: number): Promise<EventGuest> {
    const [eventGuest] = await db
      .insert(eventGuests)
      .values({ eventId, guestId })
      .returning();
    return eventGuest;
  }

  async removeEventGuest(eventId: number, guestId: number): Promise<boolean> {
    const result = await db
      .delete(eventGuests)
      .where(and(eq(eventGuests.eventId, eventId), eq(eventGuests.guestId, guestId)));
    return result.rowCount > 0;
  }

  // Event-Dish operations
  async getEventDishes(eventId: number): Promise<EventDish[]> {
    return await db
      .select()
      .from(eventDishes)
      .where(eq(eventDishes.eventId, eventId));
  }

  async addEventDish(eventId: number, dishId: number): Promise<EventDish> {
    const [eventDish] = await db
      .insert(eventDishes)
      .values({ eventId, dishId })
      .returning();
    return eventDish;
  }

  async removeEventDish(eventId: number, dishId: number): Promise<boolean> {
    const result = await db
      .delete(eventDishes)
      .where(and(eq(eventDishes.eventId, eventId), eq(eventDishes.dishId, dishId)));
    return result.rowCount > 0;
  }

  // Guest-Dish favorite operations
  async getGuestDishFavorites(guestId: number): Promise<GuestDishFavorite[]> {
    return await db
      .select()
      .from(guestDishFavorites)
      .where(eq(guestDishFavorites.guestId, guestId));
  }

  async addGuestDishFavorite(guestId: number, dishId: number): Promise<GuestDishFavorite> {
    const [favorite] = await db
      .insert(guestDishFavorites)
      .values({ guestId, dishId })
      .returning();
    return favorite;
  }

  async removeGuestDishFavorite(guestId: number, dishId: number): Promise<boolean> {
    const result = await db
      .delete(guestDishFavorites)
      .where(and(eq(guestDishFavorites.guestId, guestId), eq(guestDishFavorites.dishId, dishId)));
    return result.rowCount > 0;
  }

  // Analytics and smart suggestions
  async getGuestMealHistory(guestId: number): Promise<any[]> {
    return await db
      .select({
        event: events,
        dish: dishes,
        eventDate: events.date,
      })
      .from(eventGuests)
      .innerJoin(events, eq(eventGuests.eventId, events.id))
      .innerJoin(eventDishes, eq(events.id, eventDishes.eventId))
      .innerJoin(dishes, eq(eventDishes.dishId, dishes.id))
      .where(eq(eventGuests.guestId, guestId))
      .orderBy(desc(events.date));
  }

  async getRepeatDishAlerts(userId: string, guestIds: number[], dishIds: number[]): Promise<any[]> {
    if (guestIds.length === 0 || dishIds.length === 0) return [];

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return await db
      .select({
        guest: guests,
        dish: dishes,
        lastServed: events.date,
        eventTitle: events.title,
      })
      .from(eventGuests)
      .innerJoin(events, eq(eventGuests.eventId, events.id))
      .innerJoin(eventDishes, eq(events.id, eventDishes.eventId))
      .innerJoin(dishes, eq(eventDishes.dishId, dishes.id))
      .innerJoin(guests, eq(eventGuests.guestId, guests.id))
      .where(
        and(
          eq(events.userId, userId),
          inArray(eventGuests.guestId, guestIds),
          inArray(eventDishes.dishId, dishIds),
          sql`${events.date} >= ${threeMonthsAgo}`
        )
      )
      .orderBy(desc(events.date));
  }

  async getDishHistory(dishId: number): Promise<any[]> {
    return await db
      .select({
        event: events,
        guests: sql<string[]>`array_agg(${guests.name})`,
        eventDate: events.date,
      })
      .from(eventDishes)
      .innerJoin(events, eq(eventDishes.eventId, events.id))
      .innerJoin(eventGuests, eq(events.id, eventGuests.eventId))
      .innerJoin(guests, eq(eventGuests.guestId, guests.id))
      .where(eq(eventDishes.dishId, dishId))
      .groupBy(events.id, events.title, events.date, events.location, events.notes, events.userId, events.createdAt, events.updatedAt)
      .orderBy(desc(events.date));
  }

  async getRecentlyServedDishes(userId: string, limit: number = 10): Promise<any[]> {
    return await db
      .select({
        dish: dishes,
        lastServed: sql<Date>`max(${events.date})`,
        timesServed: sql<number>`count(*)`,
      })
      .from(eventDishes)
      .innerJoin(events, eq(eventDishes.eventId, events.id))
      .innerJoin(dishes, eq(eventDishes.dishId, dishes.id))
      .where(eq(events.userId, userId))
      .groupBy(dishes.id, dishes.title, dishes.description, dishes.ingredients, dishes.instructions, dishes.prepTime, dishes.servings, dishes.category, dishes.tags, dishes.imageUrl, dishes.pairsWith, dishes.userId, dishes.createdAt, dishes.updatedAt)
      .orderBy(desc(sql<Date>`max(${events.date})`))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
