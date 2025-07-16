import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guests table
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  dietaryRestrictions: text("dietary_restrictions").array(),
  tags: text("tags").array(),
  notes: text("notes"),
  favoriteCategories: text("favorite_categories").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dishes table
export const dishes = pgTable("dishes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  ingredients: text("ingredients").array(),
  instructions: text("instructions"),
  prepTime: integer("prep_time"),
  servings: integer("servings"),
  category: varchar("category"),
  tags: text("tags").array(),
  imageUrl: varchar("image_url"),
  pairsWith: text("pairs_with").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  date: timestamp("date").notNull(),
  location: varchar("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event-Guest junction table
export const eventGuests = pgTable("event_guests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  guestId: integer("guest_id").notNull().references(() => guests.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event-Dish junction table
export const eventDishes = pgTable("event_dishes", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  dishId: integer("dish_id").notNull().references(() => dishes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guest-Dish favorites junction table
export const guestDishFavorites = pgTable("guest_dish_favorites", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull().references(() => guests.id),
  dishId: integer("dish_id").notNull().references(() => dishes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  guests: many(guests),
  dishes: many(dishes),
  events: many(events),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  user: one(users, { fields: [guests.userId], references: [users.id] }),
  eventGuests: many(eventGuests),
  guestDishFavorites: many(guestDishFavorites),
}));

export const dishesRelations = relations(dishes, ({ one, many }) => ({
  user: one(users, { fields: [dishes.userId], references: [users.id] }),
  eventDishes: many(eventDishes),
  guestDishFavorites: many(guestDishFavorites),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] }),
  eventGuests: many(eventGuests),
  eventDishes: many(eventDishes),
}));

export const eventGuestsRelations = relations(eventGuests, ({ one }) => ({
  event: one(events, { fields: [eventGuests.eventId], references: [events.id] }),
  guest: one(guests, { fields: [eventGuests.guestId], references: [guests.id] }),
}));

export const eventDishesRelations = relations(eventDishes, ({ one }) => ({
  event: one(events, { fields: [eventDishes.eventId], references: [events.id] }),
  dish: one(dishes, { fields: [eventDishes.dishId], references: [dishes.id] }),
}));

export const guestDishFavoritesRelations = relations(guestDishFavorites, ({ one }) => ({
  guest: one(guests, { fields: [guestDishFavorites.guestId], references: [guests.id] }),
  dish: one(dishes, { fields: [guestDishFavorites.dishId], references: [dishes.id] }),
}));

// Insert schemas
export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDishSchema = createInsertSchema(dishes).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Dish = typeof dishes.$inferSelect;
export type InsertDish = z.infer<typeof insertDishSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventGuest = typeof eventGuests.$inferSelect;
export type EventDish = typeof eventDishes.$inferSelect;
export type GuestDishFavorite = typeof guestDishFavorites.$inferSelect;
