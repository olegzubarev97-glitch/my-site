import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dishes, dailyMeals, dailyMealDishes } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

const MEAL_TYPE_ORDER: Record<string, number> = {
  "Завтрак": 0,
  "Обед": 1,
  "Ужин": 2,
  "Перекус": 3,
};

function getMostFrequentMealType(
  dishId: number,
  links: { dishId: number; mealType: string }[]
): string {
  const counts = new Map<string, number>();
  for (const link of links) {
    if (link.dishId !== dishId) continue;
    const mt = link.mealType;
    counts.set(mt, (counts.get(mt) ?? 0) + 1);
  }
  let best = "Перекус";
  let bestCount = 0;
  for (const [mt, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = mt;
    }
  }
  return best;
}

export const dishRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(dishes)
      .where(eq(dishes.isActive, true))
      .orderBy(dishes.name);
  }),

  getById: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(dishes)
        .where(eq(dishes.id, input.id))
        .limit(1);
      return results[0] ?? null;
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        calories: z.number().int().min(0),
        protein: z.string().min(1),
        fat: z.string().min(1),
        carbs: z.string().min(1),
        weight: z.string().min(1),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(dishes).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        calories: z.number().int().min(0).optional(),
        protein: z.string().min(1).optional(),
        fat: z.string().min(1).optional(),
        carbs: z.string().min(1).optional(),
        weight: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(dishes).set(data).where(eq(dishes.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(dishes).where(eq(dishes.id, input.id));
      return { success: true };
    }),

  adminList: adminQuery.query(async () => {
    const db = getDb();
    const allDishes = await db.select().from(dishes).orderBy(dishes.name);

    // Get meal type usage for each dish
    const links = await db
      .select({
        dishId: dailyMealDishes.dishId,
        mealType: dailyMeals.mealType,
      })
      .from(dailyMealDishes)
      .innerJoin(dailyMeals, eq(dailyMeals.id, dailyMealDishes.dailyMealId));

    const dishesWithCategory = allDishes.map((dish) => ({
      ...dish,
      category: getMostFrequentMealType(dish.id, links),
    }));

    // Sort by category order, then by name
    return dishesWithCategory.sort((a, b) => {
      const catDiff =
        (MEAL_TYPE_ORDER[a.category] ?? 99) -
        (MEAL_TYPE_ORDER[b.category] ?? 99);
      if (catDiff !== 0) return catDiff;
      return a.name.localeCompare(b.name, "ru");
    });
  }),
});
