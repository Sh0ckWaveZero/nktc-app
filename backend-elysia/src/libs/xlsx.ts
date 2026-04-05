import * as XLSX from "xlsx";
import { prisma } from "./prisma";
import { Role } from "../../generated/client";

export interface XLSXParseResult<T> {
  data: T[];
  errors: Array<{ row: number; column: string; message: string }>;
}

export function parseXLSX<T>(buffer: Buffer, schema: Record<string, string>): XLSXParseResult<T> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false });

  const data: T[] = [];
  const errors: Array<{ row: number; column: string; message: string }> = [];

  rows.forEach((row, rowIndex) => {
    const record: Record<string, unknown> = {};
    let hasError = false;

    for (const [xlsxColumn, dbField] of Object.entries(schema)) {
      const value = row[xlsxColumn];
      if (value !== undefined && value !== null && value !== "") {
        record[dbField] = value;
      } else if (xlsxColumn.includes("*")) {
        errors.push({
          row: rowIndex + 2,
          column: xlsxColumn.replace(/\*/g, ""),
          message: `Required field is missing`,
        });
        hasError = true;
      }
    }

    if (!hasError) {
      data.push(record as T);
    }
  });

  return { data, errors };
}

export async function importStudentsFromXLSX(
  buffer: Buffer,
  createdBy: string
): Promise<{ success: number; errors: Array<{ row: number; message: string }> }> {
  const schema: Record<string, string> = {
    "รหัสนักเรียน*": "studentId",
    "คำนำหน้า": "title",
    "ชื่อ": "firstName",
    "นามสกุล": "lastName",
    "รหัสห้องเรียน": "classroomId",
    "รหัสสาขา": "programId",
    "รหัสแผนก": "departmentId",
    "รหัสระดับ": "levelId",
    "เบอร์โทร": "phone",
    "อีเมล": "email",
  };

  const { data, errors } = parseXLSX<Record<string, unknown>>(buffer, schema);

  if (errors.length > 0) {
    return {
      success: 0,
      errors: errors.map((e) => ({ row: e.row, message: `${e.column}: ${e.message}` })),
    };
  }

  let success = 0;
  const importErrors: Array<{ row: number; message: string }> = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      const studentId = row.studentId as string;

      const existingUser = await prisma.user.findFirst({
        where: { username: studentId },
      });

      if (existingUser) {
        importErrors.push({ row: i + 2, message: `รหัสนักเรียน ${studentId} มีอยู่แล้ว` });
        continue;
      }

      const hashedPassword = await import("bcryptjs").then((m) =>
        m.hash(studentId, 10)
      );

      const user = await prisma.user.create({
        data: {
          username: studentId,
          password: hashedPassword,
          role: Role.Student,
          email: row.email as string | undefined,
          createdBy,
        },
      });

      await prisma.account.create({
        data: {
          userId: user.id,
          title: row.title as string | undefined,
          firstName: row.firstName as string | undefined,
          lastName: row.lastName as string | undefined,
          phone: row.phone as string | undefined,
        },
      });

      await prisma.student.create({
        data: {
          userId: user.id,
          studentId,
          classroomId: row.classroomId as string | undefined,
          programId: row.programId as string | undefined,
          departmentId: row.departmentId as string | undefined,
          levelId: row.levelId as string | undefined,
          createdBy,
        },
      });

      success++;
    } catch (error) {
      importErrors.push({
        row: i + 2,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { success, errors: importErrors };
}

export async function importTeachersFromXLSX(
  buffer: Buffer,
  createdBy: string
): Promise<{ success: number; errors: Array<{ row: number; message: string }> }> {
  const schema: Record<string, string> = {
    "รหัสครู*": "teacherId",
    "คำนำหน้า": "title",
    "ชื่อ": "firstName",
    "นามสกุล": "lastName",
    "รหัสสาขา": "programId",
    "รหัสแผนก": "departmentId",
    "ตำแหน่ง": "jobTitle",
    "วิทยฐานะ": "academicStanding",
    "เบอร์โทร": "phone",
    "อีเมล": "email",
  };

  const { data, errors } = parseXLSX<Record<string, unknown>>(buffer, schema);

  if (errors.length > 0) {
    return {
      success: 0,
      errors: errors.map((e) => ({ row: e.row, message: `${e.column}: ${e.message}` })),
    };
  }

  let success = 0;
  const importErrors: Array<{ row: number; message: string }> = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      const teacherId = row.teacherId as string;

      const existingUser = await prisma.user.findFirst({
        where: { username: teacherId },
      });

      if (existingUser) {
        importErrors.push({ row: i + 2, message: `รหัสครู ${teacherId} มีอยู่แล้ว` });
        continue;
      }

      const hashedPassword = await import("bcryptjs").then((m) =>
        m.hash(teacherId, 10)
      );

      const user = await prisma.user.create({
        data: {
          username: teacherId,
          password: hashedPassword,
          role: Role.Teacher,
          email: row.email as string | undefined,
          createdBy,
        },
      });

      await prisma.account.create({
        data: {
          userId: user.id,
          title: row.title as string | undefined,
          firstName: row.firstName as string | undefined,
          lastName: row.lastName as string | undefined,
          phone: row.phone as string | undefined,
        },
      });

      await prisma.teacher.create({
        data: {
          userId: user.id,
          teacherId,
          programId: row.programId as string | undefined,
          departmentId: row.departmentId as string | undefined,
          jobTitle: row.jobTitle as string | undefined,
          academicStanding: row.academicStanding as string | undefined,
          createdBy,
        },
      });

      success++;
    } catch (error) {
      importErrors.push({
        row: i + 2,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { success, errors: importErrors };
}

export function generateStudentTemplate(): Buffer {
  const headers = [
    ["รหัสนักเรียน*", "คำนำหน้า", "ชื่อ", "นามสกุล", "รหัสห้องเรียน", "รหัสสาขา", "รหัสแผนก", "รหัสระดับ", "เบอร์โทร", "อีเมล"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, worksheet, "นักเรียน");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function generateTeacherTemplate(): Buffer {
  const headers = [
    ["รหัสครู*", "คำนำหน้า", "ชื่อ", "นามสกุล", "รหัสสาขา", "รหัสแผนก", "ตำแหน่ง", "วิทยฐานะ", "เบอร์โทร", "อีเมล"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, worksheet, "ครู");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}