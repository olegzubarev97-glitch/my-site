import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dishes } from "@db/schema";
import { eq, desc } from "drizzle-orm";

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
    return db.select().from(dishes).orderBy(desc(dishes.createdAt));
  }),
});
