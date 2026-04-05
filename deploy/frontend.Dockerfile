FROM oven/bun:1.3.11-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY frontend/package.json frontend/package.json
COPY backend-elysia/package.json backend-elysia/package.json

RUN bun install --ignore-scripts

FROM deps AS builder
WORKDIR /app

COPY frontend ./frontend

WORKDIR /app/frontend

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "frontend/server.js"]
