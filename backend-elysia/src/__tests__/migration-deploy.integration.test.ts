import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { Client } from "pg";

const databaseUrl = process.env.PRISMA_TEST_DATABASE_URL;
const root = resolve(import.meta.dir, "../..");
const initialName = "20261026143100_init";
const initialChecksum = "d78fcce5e80c72ca9093a415df586e296ef949a330dc130a7f320a6ecf8cdb33";
const calendarName = "20261027140000_academic_calendar";
const calendarChecksum = "48b5a4a2706b180db39740314f0a5e85c2a404a2340bbeb9ab6ee40d0c3b8b74";
const schemas: string[] = [];
const quote = (value: string): string => `"${value.replaceAll('"', '""')}"`;

const runDeploy = async (url: string, args: string[] = []) => {
  const child = Bun.spawn([process.execPath, "prisma/deploy-migrations.ts", ...args], {
    cwd: root,
    env: { ...process.env, DATABASE_URL: url },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { stdout, stderr, exitCode };
};

describe.skipIf(!databaseUrl)("migration deployment with PostgreSQL", () => {
  let client: Client;
  let initialSql: string;

  beforeAll(async () => {
    if (!databaseUrl) throw new Error("PRISMA_TEST_DATABASE_URL is required");
    client = new Client({ connectionString: databaseUrl });
    await client.connect();
    initialSql = await Bun.file(resolve(root, "prisma/migrations", initialName, "migration.sql")).text();
  });

  afterAll(async () => {
    if (!client) return;
    for (const schema of schemas) await client.query(`DROP SCHEMA ${quote(schema)} CASCADE`);
    await client.end();
  });

  const createSchema = async (): Promise<{ schema: string; url: string }> => {
    if (!databaseUrl) throw new Error("PRISMA_TEST_DATABASE_URL is required");
    const schema = `nktc_migration_test_${randomUUID().replaceAll("-", "")}`;
    await client.query(`CREATE SCHEMA ${quote(schema)}`);
    schemas.push(schema);
    const url = new URL(databaseUrl);
    url.searchParams.set("schema", schema);
    return { schema, url: url.toString() };
  };

  const createLegacy = async (): Promise<{ schema: string; url: string }> => {
    const target = await createSchema();
    await client.query(`SET search_path TO ${quote(target.schema)}`);
    await client.query(initialSql);
    await client.query("RESET search_path");
    await client.query(`
      CREATE TABLE ${quote(target.schema)}."_prisma_migrations" (
        id VARCHAR(36) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        finished_at TIMESTAMPTZ,
        migration_name VARCHAR(255) NOT NULL,
        logs TEXT,
        rolled_back_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      )
    `);
    await client.query(
      `INSERT INTO ${quote(target.schema)}."_prisma_migrations"
       (id, checksum, finished_at, migration_name, applied_steps_count)
       VALUES ('legacy', $1, now(), '20260101000000_baseline', 1)`,
      ["0".repeat(64)],
    );
    await client.query(
      `INSERT INTO ${quote(target.schema)}."_prisma_migrations"
       (id, checksum, migration_name, logs, applied_steps_count)
       VALUES ('failed', $1, $2, 'ERROR: type "Role" already exists', 0)`,
      [initialChecksum, initialName],
    );
    return target;
  };

  it("keeps the normal initial migration for a fresh database", async () => {
    const { schema, url } = await createSchema();
    const result = await runDeploy(url);
    expect(result.exitCode, result.stderr).toBe(0);
    const { rows } = await client.query(
      `SELECT migration_name FROM ${quote(schema)}."_prisma_migrations"
       WHERE finished_at IS NOT NULL ORDER BY migration_name`,
    );
    expect(rows.map((row) => row.migration_name)).toEqual([initialName, calendarName]);
  }, 30_000);

  it("rolls back only the failed history entry and preserves legacy data", async () => {
    const { schema, url } = await createLegacy();
    await client.query(
      `INSERT INTO ${quote(schema)}."user" (id, username, password, updated_at)
       VALUES ('sentinel', 'sentinel', 'test-only', now())`,
    );
    const preview = await runDeploy(url, ["--check-only"]);
    expect(preview.exitCode, preview.stderr).toBe(0);
    const before = await client.query(
      `SELECT rolled_back_at FROM ${quote(schema)}."_prisma_migrations" WHERE id = 'failed'`,
    );
    expect(before.rows[0].rolled_back_at).toBeNull();
    const result = await runDeploy(url);
    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stderr).toContain("skipped without being marked applied");
    const history = await client.query(
      `SELECT migration_name, finished_at, rolled_back_at FROM ${quote(schema)}."_prisma_migrations"
       ORDER BY started_at`,
    );
    expect(history.rows.find((row) => row.migration_name === initialName)?.rolled_back_at).not.toBeNull();
    expect(history.rows.some((row) => row.migration_name === initialName && row.finished_at)).toBe(false);
    expect(history.rows.some((row) => row.migration_name === calendarName && row.finished_at)).toBe(true);
    const data = await client.query(`SELECT id FROM ${quote(schema)}."user" WHERE id = 'sentinel'`);
    expect(data.rows).toEqual([{ id: "sentinel" }]);
    const repeat = await runDeploy(url);
    expect(repeat.exitCode, repeat.stderr).toBe(0);
  }, 30_000);

  it("preserves an already-applied calendar migration", async () => {
    const { schema, url } = await createLegacy();
    const calendarSql = await Bun.file(resolve(root, "prisma/migrations", calendarName, "migration.sql")).text();
    await client.query(`SET search_path TO ${quote(schema)}`);
    await client.query(calendarSql);
    await client.query("RESET search_path");
    await client.query(
      `INSERT INTO ${quote(schema)}."_prisma_migrations"
       (id, checksum, finished_at, migration_name, applied_steps_count)
       VALUES ('calendar', $1, now(), $2, 1)`,
      [calendarChecksum, calendarName],
    );
    const result = await runDeploy(url);
    expect(result.exitCode, result.stderr).toBe(0);
    const { rows } = await client.query(
      `SELECT migration_name, finished_at, rolled_back_at FROM ${quote(schema)}."_prisma_migrations"
       WHERE migration_name IN ($1, $2)`,
      [initialName, calendarName],
    );
    expect(rows.find((row) => row.migration_name === initialName)?.rolled_back_at).not.toBeNull();
    expect(rows.filter((row) => row.migration_name === calendarName && row.finished_at)).toHaveLength(1);
  }, 30_000);

  it("rejects calendar history when the calendar tables are missing", async () => {
    const { schema, url } = await createLegacy();
    await client.query(
      `INSERT INTO ${quote(schema)}."_prisma_migrations"
       (id, checksum, finished_at, migration_name, applied_steps_count)
       VALUES ('calendar', $1, now(), $2, 1)`,
      [calendarChecksum, calendarName],
    );
    const result = await runDeploy(url);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("applied calendar migration has incompatible columns");
    const { rows } = await client.query(
      `SELECT rolled_back_at FROM ${quote(schema)}."_prisma_migrations" WHERE id = 'failed'`,
    );
    expect(rows[0].rolled_back_at).toBeNull();
  }, 30_000);

  it("does not resolve the failure when an existing table is incompatible", async () => {
    const { schema, url } = await createLegacy();
    await client.query(`ALTER TABLE ${quote(schema)}."user" DROP COLUMN username CASCADE`);
    const result = await runDeploy(url);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("user.username");
    const { rows } = await client.query(
      `SELECT rolled_back_at FROM ${quote(schema)}."_prisma_migrations" WHERE id = 'failed'`,
    );
    expect(rows[0].rolled_back_at).toBeNull();
  }, 30_000);

  it("does not resolve a different initial-migration failure", async () => {
    const { schema, url } = await createLegacy();
    await client.query(`UPDATE ${quote(schema)}."_prisma_migrations" SET logs = 'other failure' WHERE id = 'failed'`);
    const result = await runDeploy(url);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("not the expected duplicate Role error");
    const { rows } = await client.query(
      `SELECT rolled_back_at FROM ${quote(schema)}."_prisma_migrations" WHERE id = 'failed'`,
    );
    expect(rows[0].rolled_back_at).toBeNull();
  }, 30_000);

  it("does not resolve the failure if calendar tables already exist without history", async () => {
    const { schema, url } = await createLegacy();
    await client.query(`CREATE TABLE ${quote(schema)}.academic_calendar_year (id integer)`);
    const result = await runDeploy(url);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Calendar tables already exist");
    const { rows } = await client.query(
      `SELECT rolled_back_at FROM ${quote(schema)}."_prisma_migrations" WHERE id = 'failed'`,
    );
    expect(rows[0].rolled_back_at).toBeNull();
  }, 30_000);
});
