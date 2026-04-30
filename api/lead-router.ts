import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { leads } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const leadRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        phone: z.string().min(1).max(50),
        goal: z.enum(["slim", "fit", "sport", "mass", "maintenance"]).default("fit"),
        comment: z.string().optional(),
        rationId: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(leads).values({
        ...input,
        status: "new",
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  list: adminQuery
    .input(
      z.object({
        status: z.enum(["new", "contacted", "closed"]).optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const status = input?.status;
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      const conditions = status ? eq(leads.status, status) : undefined;
      return db.select().from(leads).where(conditions).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["new", "contacted", "closed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(leads)
        .set({ status: input.status })
        .where(eq(leads.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(leads).where(eq(leads.id, input.id));
      return { success: true };
    }),

  stats: adminQuery.query(async () => {
    const db = getDb();
    const allLeads = await db.select().from(leads);
    return {
      total: allLeads.length,
      new: allLeads.filter((l) => l.status === "new").length,
      contacted: allLeads.filter((l) => l.status === "contacted").length,
      closed: allLeads.filter((l) => l.status === "closed").length,
    };
  }),
});
