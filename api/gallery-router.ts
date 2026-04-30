import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { galleryImages } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const galleryRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.isActive, true))
      .orderBy(asc(galleryImages.sortOrder));
  }),

  adminList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(galleryImages).orderBy(asc(galleryImages.sortOrder));
  }),

  create: adminQuery
    .input(
      z.object({
        url: z.string().min(1),
        caption: z.string().optional(),
        sortOrder: z.number().int().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(galleryImages).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        url: z.string().optional(),
        caption: z.string().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(galleryImages).set(data).where(eq(galleryImages.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(galleryImages).where(eq(galleryImages.id, input.id));
      return { success: true };
    }),
});
