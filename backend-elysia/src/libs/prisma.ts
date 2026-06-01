import "dotenv/config";
import { PrismaClient } from "../../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "../infrastructure/logging/index.ts";

const DATABASE_URL = process.env.DATABASE_URL;

// Parse database URL for logging (hide password)
function parseDbUrl(url: string): { host: string; port: string; database: string } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || "5432",
      database: parsed.pathname.slice(1),
    };
  } catch {
    return { host: "unknown", port: "5432", database: "unknown" };
  }
}

const dbInfo = parseDbUrl(DATABASE_URL || "");

logger.info("🗄️ Initializing database connection", {
  host: dbInfo.host,
  port: dbInfo.port,
  database: dbInfo.database,
});

// Pass connection config directly to PrismaPg so it uses its own internal pg.Pool.
// Passing an external pg.Pool fails instanceof check (different module instances) -> ECONNREFUSED.
const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
} as any);

export const prisma = new PrismaClient({ 
  adapter,
  // Log queries in development
  log: process.env.NODE_ENV === "development" 
    ? [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
      ]
    : [
        { emit: "event", level: "error" },
      ],
});

// Query logging
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    logger.debug("Query executed", {
      query: e.query.substring(0, 200),
      duration: `${e.duration}ms`,
    });
  });
}

prisma.$on("error", (e) => {
  logger.error("Prisma error", { error: e.message });
});

prisma.$on("warn", (e) => {
  logger.warn("Prisma warning", { message: e.message });
});

// Test connection on startup
async function testConnection() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info("✅ Database connected successfully", {
      host: dbInfo.host,
      database: dbInfo.database,
    });
  } catch (error) {
    logger.error("❌ Database connection failed", {
      host: dbInfo.host,
      database: dbInfo.database,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function initializeDatabase() {
  await testConnection();
}

let isDisconnecting = false;

// Graceful shutdown
process.on("beforeExit", async () => {
  if (isDisconnecting) return;
  isDisconnecting = true;

  logger.info("Closing database connections");
  try {
    await prisma.$disconnect();
  } catch (error) {
    logger.error("Error during graceful shutdown", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
});