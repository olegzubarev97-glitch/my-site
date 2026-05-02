import { authRouter } from "./auth-router";
import { rationRouter } from "./ration-router";
import { dishRouter } from "./dish-router";
import { leadRouter } from "./lead-router";
import { contentRouter } from "./content-router";
import { configRouter } from "./config-router";
import { galleryRouter } from "./gallery-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  ration: rationRouter,
  dish: dishRouter,
  lead: leadRouter,
  content: contentRouter,
  config: configRouter,
  gallery: galleryRouter,
});

export type AppRouter = typeof appRouter;
