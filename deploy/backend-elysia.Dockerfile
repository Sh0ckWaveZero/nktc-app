FROM oven/bun:1.3.11-alpine AS deps
WORKDIR /app/backend-elysia

COPY backend-elysia/package.json backend-elysia/bun.lock ./

RUN bun install --frozen-lockfile

FROM deps AS prisma
WORKDIR /app/backend-elysia

COPY backend-elysia/prisma ./prisma
COPY backend-elysia/prisma.config.ts ./

RUN bunx prisma generate

FROM prisma AS builder
WORKDIR /app/backend-elysia

COPY backend-elysia/src ./src
COPY backend-elysia/tsconfig.json ./

RUN bun run build

FROM oven/bun:1.3.11-alpine AS runner
WORKDIR /app/backend-elysia

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/backend-elysia/dist ./dist
COPY --from=prisma /app/backend-elysia/generated ./generated
COPY --from=deps /app/backend-elysia/node_modules ./node_modules
COPY backend-elysia/package.json ./

EXPOSE 3001

CMD ["bun", "dist/index.js"]
