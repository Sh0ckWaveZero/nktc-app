import { describe, expect, it } from "bun:test";

import {
  findColumnMismatches,
  parseInitialColumns,
  planMigrations,
  validateLegacyPendingMigrations,
} from "../../prisma/deploy-migrations";

describe("legacy migration safeguards", () => {
  const names: string[] = [
    "20260101000000_baseline",
    "20260530220000_add_activity_type_and_note",
    "20260811124000_add_auth_mfa_passkeys",
    "20260812113000_add_system_setting",
    "20261026143100_init",
    "20261027140000_academic_calendar",
    "20261028090000_academic_years",
  ];

  it("creates the initial schema before upstream alterations on a fresh database", () => {
    const plan = planMigrations(names, []);
    expect(plan.bootstrap).toEqual(["20261026143100_init"]);
    expect(plan.deploy).toEqual(names.filter((name) => name !== "20260530220000_add_activity_type_and_note"));
  });

  it("keeps auth and system settings without reapplying activity columns after the feature initial migration", () => {
    const plan = planMigrations(names, ["20261026143100_init"]);
    expect(plan.bootstrap).toEqual([]);
    expect(plan.deploy).toContain("20260811124000_add_auth_mfa_passkeys");
    expect(plan.deploy).toContain("20260812113000_add_system_setting");
    expect(plan.deploy).not.toContain("20260530220000_add_activity_type_and_note");
  });

  it("preserves upstream migration history while skipping the duplicate initial schema", () => {
    const plan = planMigrations(names, names.slice(0, 4));
    expect(plan.bootstrap).toEqual([]);
    expect(plan.deploy).toEqual(names.filter((name) => name !== "20261026143100_init"));
  });

  it("skips duplicate activity columns only after the legacy schema has been checked", () => {
    const plan = planMigrations(names, ["20260101000000_baseline"]);
    expect(plan.bootstrap).toEqual([]);
    expect(plan.deploy).not.toContain("20261026143100_init");
    expect(plan.deploy).not.toContain("20260530220000_add_activity_type_and_note");
    expect(plan.deploy).toContain("20261028090000_academic_years");
  });

  it("checks every table and column in the initial migration", async () => {
    const sql = await Bun.file("prisma/migrations/20261026143100_init/migration.sql").text();
    const columns = parseInitialColumns(sql);
    expect(new Set(columns.map((column) => column.table)).size).toBe(22);
    expect(columns).toHaveLength(254);
    expect(columns).toContainEqual({ table: "user", column: "role", type: '"Role"', required: true });
  });

  it("rejects unknown column definitions instead of skipping them", async () => {
    const sql = await Bun.file("prisma/migrations/20261026143100_init/migration.sql").text();
    expect(() => parseInitialColumns(sql.replace('"username" TEXT', '"username" UUID'))).toThrow(
      "Unsupported migration column",
    );
  });

  it("detects missing columns, incompatible types, and nullability changes", () => {
    const expected = [
      { table: "user", column: "id", type: "TEXT" as const, required: true },
      { table: "user", column: "role", type: '"Role"' as const, required: true },
      { table: "user", column: "updated_at", type: "TIMESTAMP(3)" as const, required: true },
    ];
    const actual = [
      { table_name: "user", column_name: "id", data_type: "text", udt_name: "text", udt_schema: "pg_catalog", datetime_precision: null, is_nullable: "NO" },
      { table_name: "user", column_name: "role", data_type: "USER-DEFINED", udt_name: "Role", udt_schema: "public", datetime_precision: null, is_nullable: "NO" },
      { table_name: "user", column_name: "updated_at", data_type: "timestamp without time zone", udt_name: "timestamp", udt_schema: "pg_catalog", datetime_precision: 3, is_nullable: "NO" },
    ];
    expect(findColumnMismatches(expected, actual, "public")).toEqual([]);
    expect(findColumnMismatches(expected, [
      { ...actual[0], is_nullable: "YES" },
      { ...actual[1], udt_schema: "other" },
    ], "public")).toEqual(["user.id", "user.role", "user.updated_at"]);
  });

  it("blocks unrelated pending migrations until legacy history is reconciled", () => {
    expect(() => validateLegacyPendingMigrations([], false)).not.toThrow();
    expect(() => validateLegacyPendingMigrations(["20261027140000_academic_calendar"], false)).not.toThrow();
    expect(() => validateLegacyPendingMigrations(["20261101000000_other"], false)).toThrow(
      "Legacy migration history needs review",
    );
    expect(() => validateLegacyPendingMigrations(["20261101000000_other"], true)).not.toThrow();
  });
});
