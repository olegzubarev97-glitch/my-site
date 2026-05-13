FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit && npm cache clean --force

FROM deps AS build
COPY . .
RUN npm rebuild esbuild
RUN npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/db ./db
COPY --from=build /app/package.json ./
COPY --from=build /app/drizzle.config.ts ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/trpc/ping || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
