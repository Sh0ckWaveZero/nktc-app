import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: process.env.NKTC_PRISMA_MIGRATIONS_DIR ?? "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
