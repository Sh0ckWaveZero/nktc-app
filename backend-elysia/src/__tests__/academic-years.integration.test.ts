import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";

const databaseUrl = process.env.ACADEMIC_YEAR_TEST_DATABASE_URL;

describe.skipIf(!databaseUrl)("academic year lifecycle with PostgreSQL", () => {
  it("isolates years across reads, writes, relations, visits and concurrent activation", async () => {
    if (!databaseUrl) throw new Error("ACADEMIC_YEAR_TEST_DATABASE_URL is required");
    const child = Bun.spawn(["bun", "scripts/check-academic-years.ts"], {
      cwd: resolve(import.meta.dir, "../.."),
      env: { ...Bun.env, DATABASE_URL: databaseUrl },
      stdout: "pipe", stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
    ]);
    if (exitCode !== 0) throw new Error(`${stdout}\n${stderr}`);
    expect(stdout).toContain("PASS historical reads");
    expect(stdout).toContain("PASS checked relation writes");
    expect(exitCode).toBe(0);
  }, 30_000);
});
