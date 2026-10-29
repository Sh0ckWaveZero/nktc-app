FROM oven/bun:1.4.4-alpine AS deps
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
ARG NEXT_PUBLIC_APP_URL=https://nktc.thapabp.com
ARG NEXT_PUBLIC_API_BASE_PATH=/api/backend
ARG NEXT_PUBLIC_EDUCATION_YEARS=2569
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_BASE_PATH=$NEXT_PUBLIC_API_BASE_PATH
ENV NEXT_PUBLIC_EDUCATION_YEARS=$NEXT_PUBLIC_EDUCATION_YEARS
ENV NEXT_STANDALONE=true

# Keep production builds on Webpack; Bun 1.3.11/Turbopack can fail while loading Next's CJS runtime.
RUN bun --version && bun run build -- --webpack

FROM node:24.22.1-alpine AS runner
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
