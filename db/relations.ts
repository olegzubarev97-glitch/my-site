import { relations } from "drizzle-orm";
import { rations, rationDays, dailyMeals, dailyMealDishes, dishes } from "./schema";

export const rationsRelations = relations(rations, ({ many }) => ({
  days: many(rationDays),
}));

export const rationDaysRelations = relations(rationDays, ({ one, many }) => ({
  ration: one(rations, {
    fields: [rationDays.rationId],
    references: [rations.id],
  }),
  meals: many(dailyMeals),
}));

export const dailyMealsRelations = relations(dailyMeals, ({ one, many }) => ({
  rationDay: one(rationDays, {
    fields: [dailyMeals.rationDayId],
    references: [rationDays.id],
  }),
  dishes: many(dailyMealDishes),
}));

export const dailyMealDishesRelations = relations(dailyMealDishes, ({ one }) => ({
  dailyMeal: one(dailyMeals, {
    fields: [dailyMealDishes.dailyMealId],
    references: [dailyMeals.id],
  }),
  dish: one(dishes, {
    fields: [dailyMealDishes.dishId],
    references: [dishes.id],
  }),
}));

export const dishesRelations = relations(dishes, ({ many }) => ({
  dailyMealDishes: many(dailyMealDishes),
}));
