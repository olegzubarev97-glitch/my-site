import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteContent } from "@db/schema";
import { eq } from "drizzle-orm";

export const contentRouter = createRouter({
  getAll: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(siteContent);
  }),

  getByKey: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, input.key))
        .limit(1);
      return results[0] ?? null;
    }),

  getBySection: publicQuery
    .input(z.object({ section: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(siteContent)
        .where(eq(siteContent.section, input.section));
    }),

  update: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, input.key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteContent)
          .set({ content: input.content })
          .where(eq(siteContent.key, input.key));
      } else {
        await db.insert(siteContent).values({
          key: input.key,
          section: "custom",
          content: input.content,
        });
      }
      return { success: true };
    }),

  create: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        section: z.string().min(1),
        content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(siteContent).values(input);
      return { id: Number(result[0].insertId) };
    }),

  delete: adminQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(siteContent).where(eq(siteContent.key, input.key));
      return { success: true };
    }),
});
