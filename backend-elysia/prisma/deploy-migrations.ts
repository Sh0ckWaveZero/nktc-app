import "dotenv/config";

import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Client } from "pg";

const INITIAL_MIGRATION = "20261026143100_init";
const INITIAL_CHECKSUM = "d78fcce5e80c72ca9093a415df586e296ef949a330dc130a7f320a6ecf8cdb33";
const CALENDAR_MIGRATION = "20261027140000_academic_calendar";
const CALENDAR_CHECKSUM = "48b5a4a2706b180db39740314f0a5e85c2a404a2340bbeb9ab6ee40d0c3b8b74";
const CALENDAR_TABLES = ["academic_calendar_year", "academic_calendar_state", "academic_calendar_event"];
const MIGRATIONS_DIR_ENV = "NKTC_PRISMA_MIGRATIONS_DIR";
const ALLOW_REVIEWED_ENV = "NKTC_ALLOW_REVIEWED_LEGACY_MIGRATIONS";
const ROOT_DIR = resolve(import.meta.dir, "..");
const MIGRATIONS_DIR = join(ROOT_DIR, "prisma", "migrations");
const ROLE_VALUES = ["Admin", "User", "Student", "Teacher", "Parent"];

type ColumnType = "TEXT" | "TEXT[]" | "INTEGER" | "BOOLEAN" | "TIMESTAMP(3)" | "DATE" | "JSONB" | '"Role"';

interface ExpectedColumn {
  table: string;
  column: string;
  type: ColumnType;
  required: boolean;
}

interface DatabaseColumn {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
  udt_schema: string;
  datetime_precision: number | null;
  is_nullable: string;
}

interface MigrationRow {
  migration_name: string;
  checksum: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
  applied_steps_count: number;
  logs: string | null;
}

const DATA_TYPES: Record<ColumnType, string> = {
  TEXT: "text",
  "TEXT[]": "ARRAY",
  INTEGER: "integer",
  BOOLEAN: "boolean",
  "TIMESTAMP(3)": "timestamp without time zone",
  DATE: "date",
  JSONB: "jsonb",
  '"Role"': "USER-DEFINED",
};

const checksum = (content: string): string => createHash("sha256").update(content).digest("hex");
const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;
const isApplied = (row: MigrationRow): boolean => row.finished_at !== null && row.rolled_back_at === null;
const isFailed = (row: MigrationRow): boolean => row.finished_at === null && row.rolled_back_at === null;
const isColumnType = (type: string): type is ColumnType => Object.hasOwn(DATA_TYPES, type);

const parseColumns = (sql: string): { tableCount: number; columns: ExpectedColumn[] } => {
  const tables = [...sql.matchAll(/CREATE TABLE "([^"]+)" \(([\s\S]*?)\n\);/g)];
  const columns: ExpectedColumn[] = [];
  for (const [, table, body] of tables) {
    for (const line of body.split("\n")) {
      if (!/^\s*"/.test(line)) continue;
      const match = line.match(/^\s*"([^"]+)"\s+(TEXT\[\]|TEXT|INTEGER|BOOLEAN|TIMESTAMP\(3\)|DATE|JSONB|"Role")(?=\s|,|$)(.*)$/);
      if (!match || !isColumnType(match[2])) throw new Error(`Unsupported migration column in ${table}: ${line.trim()}`);
      const type = match[2];
      columns.push({ table, column: match[1], type, required: /\bNOT NULL\b/.test(match[3]) });
    }
  }
  return { tableCount: tables.length, columns };
};

export const parseInitialColumns = (sql: string): ExpectedColumn[] => {
  const { tableCount, columns } = parseColumns(sql);
  if (tableCount !== 22) throw new Error("Initial migration has an unexpected table definition.");
  if (columns.length !== 254) throw new Error("Initial migration has an unexpected column count.");
  return columns;
};

const parseCalendarColumns = (sql: string): ExpectedColumn[] => {
  const { tableCount, columns } = parseColumns(sql);
  if (tableCount !== 3 || columns.length !== 25) throw new Error("Calendar migration has an unexpected table definition.");
  return columns;
};

export const findColumnMismatches = (
  expected: ExpectedColumn[],
  actual: DatabaseColumn[],
  schema: string,
): string[] => {
  const columns = new Map(actual.map((column) => [JSON.stringify([column.table_name, column.column_name]), column]));
  return expected.flatMap((column) => {
    const found = columns.get(JSON.stringify([column.table, column.column]));
    const matches = found
      && found.data_type === DATA_TYPES[column.type]
      && (column.type !== "TEXT[]" || found.udt_name === "_text")
      && (column.type !== '"Role"' || (found.udt_name === "Role" && found.udt_schema === schema))
      && (column.type !== "TIMESTAMP(3)" || found.datetime_precision === 3)
      && column.required === (found.is_nullable === "NO");
    return matches ? [] : [`${column.table}.${column.column}`];
  });
};

export const validateLegacyPendingMigrations = (pending: string[], allowReviewed: boolean): void => {
  if (!allowReviewed && pending.some((name) => name !== CALENDAR_MIGRATION)) {
    throw new Error(`Legacy migration history needs review before applying: ${pending.join(", ")}.`);
  }
};

const runPrisma = async (args: string[], migrationsDir?: string): Promise<void> => {
  const env = { ...process.env };
  if (migrationsDir) env[MIGRATIONS_DIR_ENV] = migrationsDir;
  const child = Bun.spawn(
    [process.execPath, "--bun", "node_modules/prisma/build/index.js", "migrate", ...args],
    { cwd: ROOT_DIR, env, stdout: "inherit", stderr: "inherit" },
  );
  const exitCode = await child.exited;
  if (exitCode !== 0) throw new Error(`Prisma migrate ${args[0]} failed with exit code ${exitCode}.`);
};

const getMigrationHistory = async (client: Client, schema: string): Promise<MigrationRow[]> => {
  const table = await client.query<{ name: string | null }>(
    "SELECT to_regclass(format('%I.%I', $1::text, '_prisma_migrations'))::text AS name",
    [schema],
  );
  if (!table.rows[0]?.name) return [];
  const result = await client.query<MigrationRow>(
    `SELECT migration_name, checksum, finished_at, rolled_back_at, applied_steps_count, logs
     FROM ${quoteIdentifier(schema)}."_prisma_migrations" ORDER BY started_at`,
  );
  return result.rows;
};

const validateLegacySchema = async (
  client: Client,
  schema: string,
  initialSql: string,
): Promise<DatabaseColumn[]> => {
  const expected = parseInitialColumns(initialSql);
  const result = await client.query<DatabaseColumn>(
    `SELECT table_name, column_name, data_type, udt_name, udt_schema, datetime_precision, is_nullable
     FROM information_schema.columns WHERE table_schema = $1`,
    [schema],
  );
  const mismatches = findColumnMismatches(expected, result.rows, schema);
  if (mismatches.length) {
    throw new Error(`Legacy schema is incompatible with the initial migration: ${mismatches.join(", ")}.`);
  }
  const roles = await client.query<{ enumlabel: string }>(
    `SELECT e.enumlabel FROM pg_enum e
     JOIN pg_type t ON t.oid = e.enumtypid
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE n.nspname = $1 AND t.typname = 'Role' ORDER BY e.enumsortorder`,
    [schema],
  );
  if (roles.rows.map((row) => row.enumlabel).join("\0") !== ROLE_VALUES.join("\0")) {
    throw new Error("Legacy Role enum does not match the initial migration.");
  }
  return result.rows;
};

const getMigrationNames = async (): Promise<string[]> => {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });
  if (entries.some((entry) => entry.isSymbolicLink())) {
    throw new Error("Symbolic links in the migration directory require manual review.");
  }
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
};

const createLegacyDirectory = async (names: string[]): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), "nktc-prisma-migrations-"));
  try {
    await copyFile(join(MIGRATIONS_DIR, "migration_lock.toml"), join(directory, "migration_lock.toml"));
    for (const name of names) {
      if (name === INITIAL_MIGRATION) continue;
      await mkdir(join(directory, name));
      await copyFile(join(MIGRATIONS_DIR, name, "migration.sql"), join(directory, name, "migration.sql"));
    }
    return directory;
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
};

const deploy = async (checkOnly: boolean): Promise<void> => {
  if (process.env[MIGRATIONS_DIR_ENV] !== undefined) throw new Error(`${MIGRATIONS_DIR_ENV} is reserved for migration deployment.`);
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for migration deployment.");
  const schema = new URL(databaseUrl).searchParams.get("schema") ?? "public";
  if (!schema) throw new Error("DATABASE_URL contains an empty schema.");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query("SET default_transaction_read_only = on");
    const history = await getMigrationHistory(client, schema);
    const initialApplied = history.some((row) => row.migration_name === INITIAL_MIGRATION && isApplied(row));
    const hasEarlierHistory = history.some((row) => row.migration_name < INITIAL_MIGRATION && isApplied(row));
    if (initialApplied || !hasEarlierHistory) {
      if (checkOnly) console.log("The normal Prisma migration path will be used.");
      else await runPrisma(["deploy"]);
      return;
    }

    const failed = history.filter(isFailed);
    if (failed.length > 1 || failed.some((row) => row.migration_name !== INITIAL_MIGRATION)) {
      throw new Error("Another migration has failed; resolve it explicitly before deploying.");
    }
    const initialSql = await readFile(join(MIGRATIONS_DIR, INITIAL_MIGRATION, "migration.sql"), "utf8");
    if (checksum(initialSql) !== INITIAL_CHECKSUM) {
      throw new Error("The initial migration has changed; review legacy migration history before deploying.");
    }
    const failedInitial = failed[0];
    if (failedInitial && (
      failedInitial.checksum !== INITIAL_CHECKSUM
      || failedInitial.applied_steps_count !== 0
      || !failedInitial.logs?.includes('type "Role" already exists')
    )) {
      throw new Error("The failed initial migration is not the expected duplicate Role error.");
    }
    const actualColumns = await validateLegacySchema(client, schema, initialSql);
    const names = await getMigrationNames();
    if (!names.includes(CALENDAR_MIGRATION)) throw new Error("The calendar migration is missing.");
    const appliedNames = new Set(history.filter(isApplied).map((row) => row.migration_name));
    const missingHistory = [...appliedNames].filter((name) => !names.includes(name));
    const pending = names.filter((name) => name !== INITIAL_MIGRATION && !appliedNames.has(name));
    const allowReviewed = process.env[ALLOW_REVIEWED_ENV];
    if (allowReviewed !== undefined && allowReviewed !== "true" && allowReviewed !== "false") {
      throw new Error(`${ALLOW_REVIEWED_ENV} must be "true" or "false".`);
    }
    validateLegacyPendingMigrations(pending, allowReviewed === "true");
    const calendarSql = await readFile(join(MIGRATIONS_DIR, CALENDAR_MIGRATION, "migration.sql"), "utf8");
    if (checksum(calendarSql) !== CALENDAR_CHECKSUM) throw new Error("The calendar migration has changed; review it before deploying.");
    const appliedCalendar = history.find((row) => row.migration_name === CALENDAR_MIGRATION && isApplied(row));
    if (appliedCalendar && appliedCalendar.checksum !== CALENDAR_CHECKSUM) {
      throw new Error("The applied calendar migration checksum does not match the local file.");
    }
    if (appliedCalendar) {
      const mismatches = findColumnMismatches(parseCalendarColumns(calendarSql), actualColumns, schema);
      if (mismatches.length) {
        throw new Error(`The applied calendar migration has incompatible columns: ${mismatches.join(", ")}.`);
      }
    }
    if (pending.includes(CALENDAR_MIGRATION)) {
      const tables = await client.query<{ name: string | null }>(
        "SELECT to_regclass(format('%I.%I', $1::text, table_name))::text AS name FROM unnest($2::text[]) AS table_name",
        [schema, CALENDAR_TABLES],
      );
      if (tables.rows.some((row) => row.name !== null)) {
        throw new Error("Calendar tables already exist but their migration is not applied; inspect them before deploying.");
      }
    }
    console.warn(
      `Legacy database detected: the duplicate initial migration will be skipped without being marked applied. `
      + `${missingHistory.length} historical migration file(s) are missing; indexes, defaults, and foreign keys may differ. `
      + "Restore and review the original history before creating further migrations.",
    );
    if (allowReviewed === "true" && pending.some((name) => name !== CALENDAR_MIGRATION)) {
      console.warn("Deploying additional legacy migrations because the explicit review flag is enabled.");
    }
    if (checkOnly) {
      console.log("Legacy schema checks passed; no database changes were made.");
      return;
    }
    const directory = await createLegacyDirectory(names);
    try {
      if (failedInitial) await runPrisma(["resolve", "--rolled-back", INITIAL_MIGRATION]);
      await runPrisma(["deploy"], directory);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  } finally {
    await client.end();
  }
};

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check-only") || args.length > 1) {
    console.error("Usage: bun prisma/deploy-migrations.ts [--check-only]");
    process.exitCode = 1;
  } else {
    try {
      await deploy(args.includes("--check-only"));
    } catch (error) {
      console.error("Migration deployment failed:", error);
      process.exitCode = 1;
    }
  }
}
