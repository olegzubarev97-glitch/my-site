import { z } from "zod";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findUserByUnionId } from "./queries/users";
import { comparePassword } from "./lib/password";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";
import { TRPCError } from "@trpc/server";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export const authRouter = createRouter({
  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByUnionId(input.username);
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const valid = await comparePassword(user.passwordHash, input.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: env.appId || "local",
      });

      const localhost = isLocalhost(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: true,
          path: "/",
          sameSite: localhost ? "lax" : "none",
          secure: !localhost,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true };
    }),

  me: authedQuery.query((opts) => {
    const { passwordHash, ...userWithoutPassword } = opts.ctx.user;
    return userWithoutPassword;
  }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const localhost = isLocalhost(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: true,
        path: "/",
        sameSite: localhost ? "lax" : "none",
        secure: !localhost,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
