import { describe, expect, it } from "bun:test";

const databaseUrl = process.env.PRISMA_TEST_DATABASE_URL;

describe.skipIf(!databaseUrl)("Prisma PostgreSQL adapter", () => {
  it("connects when the application and adapter resolve different pg versions", async () => {
    if (!databaseUrl) throw new Error("PRISMA_TEST_DATABASE_URL is required");
    process.env.DATABASE_URL = databaseUrl;
    const { prisma } = await import("@/libs/prisma");
    try {
      const rows = await prisma.$queryRaw<Array<{ value: number }>>`SELECT 1 AS value`;
      expect(rows).toEqual([{ value: 1 }]);
    } finally {
      await prisma.$disconnect();
    }
  });
});
