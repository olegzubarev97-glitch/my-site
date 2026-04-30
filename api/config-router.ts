import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteConfig } from "@db/schema";
import { eq } from "drizzle-orm";

export const configRouter = createRouter({
  getAll: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(siteConfig);
  }),

  getByKey: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(siteConfig)
        .where(eq(siteConfig.key, input.key))
        .limit(1);
      return results[0] ?? null;
    }),

  update: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(siteConfig)
        .where(eq(siteConfig.key, input.key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteConfig)
          .set({ value: input.value })
          .where(eq(siteConfig.key, input.key));
      } else {
        await db.insert(siteConfig).values(input);
      }
      return { success: true };
    }),

  create: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(siteConfig).values(input);
      return { id: Number(result[0].insertId) };
    }),

  delete: adminQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(siteConfig).where(eq(siteConfig.key, input.key));
      return { success: true };
    }),
});
