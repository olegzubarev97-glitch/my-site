import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { rations } from "@db/schema";
import { eq } from "drizzle-orm";

export const rationRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(rations).where(eq(rations.isActive, true)).orderBy(rations.sortOrder);
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(rations)
        .where(eq(rations.slug, input.slug))
        .limit(1);
      return results[0] ?? null;
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
        priceDay: z.number().int().positive(),
        priceWeek: z.number().int().positive(),
        description: z.string().optional(),
        targetAudience: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().int().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(rations).values(input);
      return { id: Number(result[0].insertId) };
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
        priceDay: z.number().int().positive().optional(),
        priceWeek: z.number().int().positive().optional(),
        description: z.string().optional(),
        targetAudience: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(rations).set(data).where(eq(rations.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(rations).where(eq(rations.id, input.id));
      return { success: true };
    }),

  adminList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(rations).orderBy(rations.sortOrder);
  }),
});
