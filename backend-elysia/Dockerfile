FROM oven/bun:1.3.3-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

# Generate Prisma client
FROM deps AS prisma
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN bunx prisma generate

# Build
FROM prisma AS builder
COPY src ./src
COPY tsconfig.json ./
RUN bun build src/index.ts --outdir ./dist --target bun --minify

# Production image
FROM oven/bun:1.3.3-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed
COPY --from=builder /app/dist ./dist
COPY --from=prisma /app/generated ./generated
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3001

CMD ["bun", "dist/index.js"]
