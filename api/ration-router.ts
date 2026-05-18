import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { rations, rationDays, dailyMeals, dailyMealDishes, dishes } from "@db/schema";
import { eq, inArray } from "drizzle-orm";

const mealDishSchema = z.object({
  dishId: z.number().int().positive(),
  weight: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

const mealSchema = z.object({
  mealType: z.string().min(1),
  name: z.string().max(100).optional(),
  sortOrder: z.number().int().default(0),
  dishes: z.array(mealDishSchema).default([]),
});

const daySchema = z.object({
  dayIndex: z.number().int().min(0).max(13),
  dayName: z.string().min(1).max(20),
  meals: z.array(mealSchema).default([]),
});

async function deleteRationMenu(db: ReturnType<typeof getDb>, rationId: number) {
  // Get all day IDs for this ration
  const days = await db
    .select({ id: rationDays.id })
    .from(rationDays)
    .where(eq(rationDays.rationId, rationId));

  const dayIds = days.map((d) => d.id);

  if (dayIds.length > 0) {
    // Get all meal IDs for these days
    const meals = await db
      .select({ id: dailyMeals.id })
      .from(dailyMeals)
      .where(inArray(dailyMeals.rationDayId, dayIds));

    const mealIds = meals.map((m) => m.id);

    if (mealIds.length > 0) {
      await db.delete(dailyMealDishes).where(inArray(dailyMealDishes.dailyMealId, mealIds));
      await db.delete(dailyMeals).where(inArray(dailyMeals.rationDayId, dayIds));
    } else {
      await db.delete(dailyMeals).where(inArray(dailyMeals.rationDayId, dayIds));
    }
  }

  await db.delete(rationDays).where(eq(rationDays.rationId, rationId));
}

async function buildRationMenu(
  db: ReturnType<typeof getDb>,
  rationId: number,
  daysInput: z.infer<typeof daySchema>[]
) {
  for (const dayInput of daysInput) {
    const dayResult = await db.insert(rationDays).values({
      rationId,
      dayIndex: dayInput.dayIndex,
      dayName: dayInput.dayName,
    });
    const rationDayId = Number(dayResult[0].insertId);

    for (const mealInput of dayInput.meals) {
      const mealResult = await db.insert(dailyMeals).values({
        rationDayId,
        mealType: mealInput.mealType,
        name: mealInput.name,
        sortOrder: mealInput.sortOrder,
      });
      const dailyMealId = Number(mealResult[0].insertId);

      if (mealInput.dishes.length > 0) {
        await db.insert(dailyMealDishes).values(
          mealInput.dishes.map((d) => ({
            dailyMealId,
            dishId: d.dishId,
            weight: d.weight,
            sortOrder: d.sortOrder,
          }))
        );
      }
    }
  }
}

export const rationRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(rations).where(eq(rations.isActive, true)).orderBy(rations.sortOrder);
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rationResults = await db
        .select()
        .from(rations)
        .where(eq(rations.slug, input.slug))
        .limit(1);

      const ration = rationResults[0];
      if (!ration) return null;

      const days = await db
        .select()
        .from(rationDays)
        .where(eq(rationDays.rationId, ration.id))
        .orderBy(rationDays.dayIndex);

      const daysWithMeals = await Promise.all(
        days.map(async (day) => {
          const meals = await db
            .select()
            .from(dailyMeals)
            .where(eq(dailyMeals.rationDayId, day.id))
            .orderBy(dailyMeals.sortOrder);

          const mealsWithDishes = await Promise.all(
            meals.map(async (meal) => {
              const dishLinks = await db
                .select()
                .from(dailyMealDishes)
                .where(eq(dailyMealDishes.dailyMealId, meal.id))
                .orderBy(dailyMealDishes.sortOrder);

              const dishIds = dishLinks.map((d) => d.dishId);
              let dishMap = new Map<number, typeof dishes.$inferSelect>();
              if (dishIds.length > 0) {
                const dishRows = await db
                  .select()
                  .from(dishes)
                  .where(inArray(dishes.id, dishIds));
                dishMap = new Map(dishRows.map((d) => [d.id, d]));
              }

              return {
                ...meal,
                dishes: dishLinks.map((link) => ({
                  ...link,
                  dish: dishMap.get(link.dishId) ?? null,
                })),
              };
            })
          );

          return { ...day, meals: mealsWithDishes };
        })
      );

      return { ...ration, days: daysWithMeals };
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        calories: z.number().int().positive(),
        protein: z.string().min(1),
        fat: z.string().min(1),
        carbs: z.string().min(1),
        price1Day: z.number().int().positive(),
        price5Days: z.number().int().positive(),
        price7Days: z.number().int().positive(),
        price14Days: z.number().int().positive(),
        description: z.string().optional(),
        targetAudience: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().int().default(0),
        isActive: z.boolean().default(true),
        menu: z.array(daySchema).default([]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { menu, ...rationData } = input;

      const result = await db.insert(rations).values(rationData);
      const rationId = Number(result[0].insertId);

      if (menu.length > 0) {
        await buildRationMenu(db, rationId, menu);
      }

      return { id: rationId };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).optional(),
        calories: z.number().int().positive().optional(),
        protein: z.string().min(1).optional(),
        fat: z.string().min(1).optional(),
        carbs: z.string().min(1).optional(),
        price1Day: z.number().int().positive().optional(),
        price5Days: z.number().int().positive().optional(),
        price7Days: z.number().int().positive().optional(),
        price14Days: z.number().int().positive().optional(),
        description: z.string().optional(),
        targetAudience: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
        menu: z.array(daySchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, menu, ...rationData } = input;

      if (Object.keys(rationData).length > 0) {
        await db.update(rations).set(rationData).where(eq(rations.id, id));
      }

      if (menu !== undefined) {
        await deleteRationMenu(db, id);
        if (menu.length > 0) {
          await buildRationMenu(db, id, menu);
        }
      }

      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await deleteRationMenu(db, input.id);
      await db.delete(rations).where(eq(rations.id, input.id));
      return { success: true };
    }),

  adminList: adminQuery.query(async () => {
    const db = getDb();
    const allRations = await db.select().from(rations).orderBy(rations.sortOrder);

    const rationIds = allRations.map((r) => r.id);
    let dayCounts = new Map<number, number>();

    if (rationIds.length > 0) {
      const days = await db
        .select({ rationId: rationDays.rationId, count: rationDays.id })
        .from(rationDays)
        .where(inArray(rationDays.rationId, rationIds));

      dayCounts = days.reduce((acc, d) => {
        acc.set(d.rationId, (acc.get(d.rationId) ?? 0) + 1);
        return acc;
      }, new Map<number, number>());
    }

    return allRations.map((r) => ({
      ...r,
      daysCount: dayCounts.get(r.id) ?? 0,
    }));
  }),

  getWithMenu: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rationResults = await db
        .select()
        .from(rations)
        .where(eq(rations.id, input.id))
        .limit(1);

      const ration = rationResults[0];
      if (!ration) return null;

      const days = await db
        .select()
        .from(rationDays)
        .where(eq(rationDays.rationId, ration.id))
        .orderBy(rationDays.dayIndex);

      const daysWithMeals = await Promise.all(
        days.map(async (day) => {
          const meals = await db
            .select()
            .from(dailyMeals)
            .where(eq(dailyMeals.rationDayId, day.id))
            .orderBy(dailyMeals.sortOrder);

          const mealsWithDishes = await Promise.all(
            meals.map(async (meal) => {
              const dishLinks = await db
                .select()
                .from(dailyMealDishes)
                .where(eq(dailyMealDishes.dailyMealId, meal.id))
                .orderBy(dailyMealDishes.sortOrder);

              const dishIds = dishLinks.map((d) => d.dishId);
              let dishMap = new Map<number, typeof dishes.$inferSelect>();
              if (dishIds.length > 0) {
                const dishRows = await db
                  .select()
                  .from(dishes)
                  .where(inArray(dishes.id, dishIds));
                dishMap = new Map(dishRows.map((d) => [d.id, d]));
              }

              return {
                ...meal,
                dishes: dishLinks.map((link) => ({
                  ...link,
                  dish: dishMap.get(link.dishId) ?? null,
                })),
              };
            })
          );

          return { ...day, meals: mealsWithDishes };
        })
      );

      return { ...ration, days: daysWithMeals };
    }),
});
