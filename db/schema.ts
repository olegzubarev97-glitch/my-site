import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const rations = mysqlTable("rations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  calories: int("calories").notNull(),
  protein: decimal("protein", { precision: 5, scale: 1 }).notNull(),
  fat: decimal("fat", { precision: 5, scale: 1 }).notNull(),
  carbs: decimal("carbs", { precision: 5, scale: 1 }).notNull(),
  priceDay: int("priceDay").notNull(),
  priceWeek: int("priceWeek").notNull(),
  description: text("description"),
  targetAudience: text("targetAudience"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Ration = typeof rations.$inferSelect;
export type InsertRation = typeof rations.$inferInsert;

export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  goal: mysqlEnum("goal", ["slim", "fit", "sport", "mass", "maintenance"]).default("fit").notNull(),
  comment: text("comment"),
  rationId: int("rationId"),
  status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export const siteContent = mysqlTable("siteContent", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  section: varchar("section", { length: 100 }).notNull(),
  content: text("content").notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

export const siteConfig = mysqlTable("siteConfig", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = typeof siteConfig.$inferInsert;

export const galleryImages = mysqlTable("galleryImages", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 255 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

export const dishes = mysqlTable("dishes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  caloriesPer100g: int("caloriesPer100g").notNull(),
  proteinPer100g: decimal("proteinPer100g", { precision: 5, scale: 1 }).notNull(),
  fatPer100g: decimal("fatPer100g", { precision: 5, scale: 1 }).notNull(),
  carbsPer100g: decimal("carbsPer100g", { precision: 5, scale: 1 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Dish = typeof dishes.$inferSelect;
export type InsertDish = typeof dishes.$inferInsert;

export const rationDays = mysqlTable("rationDays", {
  id: serial("id").primaryKey(),
  rationId: int("rationId").notNull(),
  dayIndex: int("dayIndex").notNull(), // 0=Пн, 1=Вт, ..., 6=Вс
  dayName: varchar("dayName", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RationDay = typeof rationDays.$inferSelect;
export type InsertRationDay = typeof rationDays.$inferInsert;

export const dailyMeals = mysqlTable("dailyMeals", {
  id: serial("id").primaryKey(),
  rationDayId: int("rationDayId").notNull(),
  mealType: varchar("mealType", { length: 20 }).notNull(), // breakfast, lunch, dinner, snack1, snack2
  name: varchar("name", { length: 100 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyMeal = typeof dailyMeals.$inferSelect;
export type InsertDailyMeal = typeof dailyMeals.$inferInsert;

export const dailyMealDishes = mysqlTable("dailyMealDishes", {
  id: serial("id").primaryKey(),
  dailyMealId: int("dailyMealId").notNull(),
  dishId: int("dishId").notNull(),
  weight: int("weight").notNull(), // grams
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyMealDish = typeof dailyMealDishes.$inferSelect;
export type InsertDailyMealDish = typeof dailyMealDishes.$inferInsert;
