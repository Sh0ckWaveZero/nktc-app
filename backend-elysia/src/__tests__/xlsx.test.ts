import { describe, it, expect, mock } from "bun:test";
import * as XLSX from "xlsx";

// Mock prisma — importStudentsFromXLSX imports it at module level
const mockUserFindFirst = mock(() => Promise.resolve(null));
const mockStudentFindFirst = mock(() => Promise.resolve(null));
const mockStudentCreate = mock(() => Promise.resolve({ id: "s-new" }));
const mockUserCreate = mock(() => Promise.resolve({ id: "u-new" }));
const mockAccountCreate = mock(() => Promise.resolve({}));
const mockStudentUpdate = mock(() => Promise.resolve({}));
const mockAccountUpdate = mock(() => Promise.resolve({}));

const mockTxFn = async (fn: (tx: any) => Promise<unknown>) => fn({
  student: { create: mockStudentCreate, update: mockStudentUpdate },
  user: { create: mockUserCreate },
  account: { create: mockAccountCreate, update: mockAccountUpdate },
});
const mockTransaction = mock(mockTxFn);

mock.module("@/libs/prisma", () => ({
  prisma: {
    student: { findFirst: mockStudentFindFirst },
    user: { findFirst: mockUserFindFirst },
    classroom: { findUnique: mock(() => Promise.resolve(null)) },
    program: { findUnique: mock(() => Promise.resolve(null)) },
    department: { findFirst: mock(() => Promise.resolve(null)) },
    level: { findUnique: mock(() => Promise.resolve(null)) },
    $transaction: mockTransaction,
  },
}));

mock.module("bcryptjs", () => ({
  default: { hash: mock(() => Promise.resolve("hashed")) },
  hash: mock(() => Promise.resolve("hashed")),
}));

mock.module("@/infrastructure/logging", () => ({
  logger: { info: mock(), warn: mock(), error: mock(), debug: mock() },
  createLogger: () => ({ info: mock(), warn: mock(), error: mock(), debug: mock() }),
}));

const { parseXLSX, generateStudentTemplate, importStudentsFromXLSX } = await import("@/libs/xlsx");
const { BadRequestError } = await import("@/libs/errors");

function makeXlsxBuffer(rows: Record<string, unknown>[]): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("generateStudentTemplate", () => {
  it("returns a Buffer", () => {
    const buf = generateStudentTemplate();
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);
  });

  it("generates a valid xlsx workbook with expected headers", () => {
    const buf = generateStudentTemplate();
    const wb = XLSX.read(buf, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
    const headers = rows[0] as string[];
    expect(headers).toContain("รหัสนักเรียน*");
    expect(headers).toContain("ชื่อ");
    expect(headers).toContain("นามสกุล");
  });
});

describe("parseXLSX", () => {
  const schema: Record<string, string> = {
    "รหัสนักเรียน*": "studentId",
    "ชื่อ": "firstName",
    "นามสกุล": "lastName",
  };

  it("returns empty rows and errors for empty sheet", () => {
    const buf = makeXlsxBuffer([]);
    const result = parseXLSX(buf, schema);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("maps column names to db field names", () => {
    const buf = makeXlsxBuffer([{ "รหัสนักเรียน*": "65001", "ชื่อ": "สมชาย", "นามสกุล": "ใจดี" }]);
    const result = parseXLSX<Record<string, unknown>>(buf, schema);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data.studentId).toBe("65001");
    expect(result.rows[0].data.firstName).toBe("สมชาย");
  });

  it("trims whitespace from string cells", () => {
    const buf = makeXlsxBuffer([{ "รหัสนักเรียน*": "  65001  ", "ชื่อ": "  สมชาย  " }]);
    const result = parseXLSX<Record<string, unknown>>(buf, schema);
    expect(result.rows[0].data.studentId).toBe("65001");
    expect(result.rows[0].data.firstName).toBe("สมชาย");
  });

  it("treats empty string cell as undefined", () => {
    const buf = makeXlsxBuffer([{ "รหัสนักเรียน*": "65001", "ชื่อ": "" }]);
    const result = parseXLSX<Record<string, unknown>>(buf, schema);
    expect(result.rows[0].data.firstName).toBeUndefined();
  });

  it("passes non-string cell values as-is (XLSX returns strings with raw:false)", () => {
    const buf = makeXlsxBuffer([{ "รหัสนักเรียน*": "65001", "ชื่อ": 42 }]);
    const result = parseXLSX<Record<string, unknown>>(buf, schema);
    // XLSX reads with raw:false — numbers become strings
    expect(result.rows[0].data.firstName).toBe("42");
  });

  it("records error for missing required field (column with *)", () => {
    const buf = makeXlsxBuffer([{ "ชื่อ": "สมชาย" }]);
    const result = parseXLSX<Record<string, unknown>>(buf, schema);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].column).toBe("รหัสนักเรียน");
    expect(result.rows).toHaveLength(0);
  });

  it("excludes row with error from parsed rows", () => {
    const buf = makeXlsxBuffer([
      { "ชื่อ": "no-id" },
      { "รหัสนักเรียน*": "65002", "ชื่อ": "ok" },
    ]);
    const result = parseXLSX<Record<string, unknown>>(buf, schema);
    expect(result.errors).toHaveLength(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data.studentId).toBe("65002");
  });
});

describe("importStudentsFromXLSX", () => {
  it("throws BadRequestError for empty xlsx with no data", async () => {
    const emptyBuf = makeXlsxBuffer([]);
    await expect(importStudentsFromXLSX(emptyBuf, "admin")).rejects.toBeInstanceOf(BadRequestError);
  });

  it("returns error summary when all rows have validation errors", async () => {
    const buf = makeXlsxBuffer([{ "ชื่อ": "no-id-here" }]);
    const result = await importStudentsFromXLSX(buf, "admin");
    expect(result.total).toBeGreaterThan(0);
    expect(result.failed).toBeGreaterThan(0);
    expect(result.success).toBe(0);
  });

  it("creates new student when no existing user or student", async () => {
    mockUserFindFirst.mockResolvedValue(null);
    mockStudentFindFirst.mockResolvedValue(null);

    const buf = makeXlsxBuffer([{ "รหัสนักเรียน*": "65001", "ชื่อ": "สมชาย", "นามสกุล": "ใจดี" }]);
    const result = await importStudentsFromXLSX(buf, "admin");
    expect(result.success).toBe(1);
    expect(result.total).toBe(1);
  });

  it("skips duplicate studentId in same file", async () => {
    mockUserFindFirst.mockResolvedValue(null);
    mockStudentFindFirst.mockResolvedValue(null);

    const buf = makeXlsxBuffer([
      { "รหัสนักเรียน*": "65001", "ชื่อ": "สมชาย" },
      { "รหัสนักเรียน*": "65001", "ชื่อ": "สมหญิง" },
    ]);
    const result = await importStudentsFromXLSX(buf, "admin");
    expect(result.failed).toBeGreaterThanOrEqual(1);
  });

  it("skips duplicate email in same file", async () => {
    mockUserFindFirst.mockResolvedValue(null);
    mockStudentFindFirst.mockResolvedValue(null);

    const buf = makeXlsxBuffer([
      { "รหัสนักเรียน*": "65001", "อีเมล": "same@test.com" },
      { "รหัสนักเรียน*": "65002", "อีเมล": "same@test.com" },
    ]);
    const result = await importStudentsFromXLSX(buf, "admin");
    expect(result.failed).toBeGreaterThanOrEqual(1);
  });

  it("reports error when non-student user already has that studentId", async () => {
    mockUserFindFirst.mockResolvedValue({ id: "u1", role: "Teacher" });
    mockStudentFindFirst.mockResolvedValue(null);

    const buf = makeXlsxBuffer([{ "รหัสนักเรียน*": "65001" }]);
    const result = await importStudentsFromXLSX(buf, "admin");
    expect(result.failed).toBeGreaterThanOrEqual(1);
  });
});
