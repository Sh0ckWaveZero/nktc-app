import * as XLSX from "xlsx";
import { prisma } from "./prisma";
import { Role } from "../../generated/client";
import { BadRequestError } from "./errors";

interface XLSXParsedRow<T> {
  row: number;
  data: T;
}

export interface XLSXParseResult<T> {
  rows: XLSXParsedRow<T>[];
  errors: Array<{ row: number; column: string; message: string }>;
}

const normalizeCellValue = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
};

const countUniqueRows = <T extends { row: number }>(items: T[]) => new Set(items.map((item) => item.row)).size;

export function parseXLSX<T>(buffer: Buffer, schema: Record<string, string>): XLSXParseResult<T> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false });

  const parsedRows: XLSXParsedRow<T>[] = [];
  const errors: Array<{ row: number; column: string; message: string }> = [];

  rows.forEach((row, rowIndex) => {
    const record: Record<string, unknown> = {};
    let hasError = false;

    for (const [xlsxColumn, dbField] of Object.entries(schema)) {
      const value = normalizeCellValue(row[xlsxColumn]);

      if (value !== undefined && value !== null) {
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
      parsedRows.push({ row: rowIndex + 2, data: record as T });
    }
  });

  return { rows: parsedRows, errors };
}

export async function importStudentsFromXLSX(
  buffer: Buffer,
  createdBy: string
): Promise<{ total: number; success: number; failed: number; updated: number; errors: Array<{ row: number; message: string }> }> {
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

  const { rows, errors } = parseXLSX<Record<string, unknown>>(buffer, schema);

  if (rows.length === 0 && errors.length === 0) {
    throw new BadRequestError("ไม่พบข้อมูลนักเรียนในไฟล์ กรุณากรอกข้อมูลอย่างน้อย 1 แถว");
  }

  let success = 0;
  let updated = 0;
  const importErrors: Array<{ row: number; message: string }> = errors.map((error) => ({
    row: error.row,
    message: `${error.column}: ${error.message}`,
  }));
  const seenStudentIds = new Set<string>();
  const seenEmails = new Set<string>();

  for (const { row: rowNumber, data: row } of rows) {
    try {
      const studentId = String(row.studentId ?? "").trim();
      const title = typeof row.title === "string" ? row.title.trim() : undefined;
      const firstName = typeof row.firstName === "string" ? row.firstName.trim() : undefined;
      const lastName = typeof row.lastName === "string" ? row.lastName.trim() : undefined;
      const phone = typeof row.phone === "string" ? row.phone.trim() : undefined;
      const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : undefined;
      const classroomCode = typeof row.classroomId === "string" ? row.classroomId.trim() : undefined;
      const programCode = typeof row.programId === "string" ? row.programId.trim() : undefined;
      const departmentCode = typeof row.departmentId === "string" ? row.departmentId.trim() : undefined;
      const levelCode = typeof row.levelId === "string" ? row.levelId.trim() : undefined;

      if (!studentId) {
        importErrors.push({ row: rowNumber, message: "รหัสนักเรียนห้ามว่าง" });
        continue;
      }

      if (seenStudentIds.has(studentId)) {
        importErrors.push({ row: rowNumber, message: `รหัสนักเรียน ${studentId} ซ้ำในไฟล์` });
        continue;
      }

      seenStudentIds.add(studentId);

      if (email) {
        if (seenEmails.has(email)) {
          importErrors.push({ row: rowNumber, message: `อีเมล ${email} ซ้ำในไฟล์` });
          continue;
        }

        seenEmails.add(email);
      }

      const [existingUser, existingStudent, existingEmailUser, classroom, program, department, level] = await Promise.all([
        prisma.user.findFirst({
          where: { username: studentId },
          select: { id: true, role: true },
        }),
        prisma.student.findFirst({
          where: { studentId },
          select: { id: true, userId: true },
        }),
        email
          ? prisma.user.findFirst({
              where: { email },
              select: { id: true },
            })
          : Promise.resolve(null),
        classroomCode
          ? prisma.classroom.findUnique({
              where: { classroomId: classroomCode },
              select: { id: true, programId: true, departmentId: true, levelId: true },
            })
          : Promise.resolve(null),
        programCode
          ? prisma.program.findUnique({
              where: { programId: programCode },
              select: { id: true },
            })
          : Promise.resolve(null),
        departmentCode
          ? prisma.department.findFirst({
              where: { departmentId: departmentCode },
              select: { id: true },
            })
          : Promise.resolve(null),
        levelCode
          ? prisma.level.findUnique({
              where: { levelId: levelCode },
              select: { id: true },
            })
          : Promise.resolve(null),
      ]);

      const targetUserId = existingStudent?.userId ?? existingUser?.id ?? null;

      if (existingUser && existingUser.role !== Role.Student && !existingStudent) {
        importErrors.push({ row: rowNumber, message: `รหัสนักเรียน ${studentId} ถูกใช้งานโดยบัญชีประเภทอื่น` });
        continue;
      }

      if (email && existingEmailUser && existingEmailUser.id !== targetUserId) {
        importErrors.push({ row: rowNumber, message: `อีเมล ${email} มีอยู่แล้ว` });
        continue;
      }

      if (classroomCode && !classroom) {
        importErrors.push({ row: rowNumber, message: `ไม่พบรหัสห้องเรียน ${classroomCode}` });
        continue;
      }

      if (programCode && !program) {
        importErrors.push({ row: rowNumber, message: `ไม่พบรหัสสาขา ${programCode}` });
        continue;
      }

      if (departmentCode && !department) {
        importErrors.push({ row: rowNumber, message: `ไม่พบรหัสแผนก ${departmentCode}` });
        continue;
      }

      if (levelCode && !level) {
        importErrors.push({ row: rowNumber, message: `ไม่พบรหัสระดับ ${levelCode}` });
        continue;
      }

      if (classroom && program && classroom.programId && classroom.programId !== program.id) {
        importErrors.push({ row: rowNumber, message: `รหัสสาขา ${programCode} ไม่ตรงกับห้องเรียน ${classroomCode}` });
        continue;
      }

      if (classroom && department && classroom.departmentId && classroom.departmentId !== department.id) {
        importErrors.push({ row: rowNumber, message: `รหัสแผนก ${departmentCode} ไม่ตรงกับห้องเรียน ${classroomCode}` });
        continue;
      }

      if (classroom && level && classroom.levelId && classroom.levelId !== level.id) {
        importErrors.push({ row: rowNumber, message: `รหัสระดับ ${levelCode} ไม่ตรงกับห้องเรียน ${classroomCode}` });
        continue;
      }

      const resolvedProgramId = program?.id ?? classroom?.programId ?? undefined;
      const resolvedDepartmentId = department?.id ?? classroom?.departmentId ?? undefined;
      const resolvedLevelId = level?.id ?? classroom?.levelId ?? undefined;
      const resolvedClassroomId = classroom?.id ?? undefined;

      await prisma.$transaction(async (tx) => {
        if (existingStudent && !targetUserId) {
          const hashedPassword = await import("bcryptjs").then((m) =>
            m.hash(studentId, 10)
          );

          const user = await tx.user.create({
            data: {
              username: studentId,
              password: hashedPassword,
              role: Role.Student,
              email,
              createdBy,
            },
            select: { id: true },
          });

          await tx.account.create({
            data: {
              userId: user.id,
              title,
              firstName,
              lastName,
              phone,
              createdBy,
            },
          });

          await tx.student.update({
            where: { id: existingStudent.id },
            data: {
              userId: user.id,
              studentId,
              classroomId: resolvedClassroomId,
              programId: resolvedProgramId,
              departmentId: resolvedDepartmentId,
              levelId: resolvedLevelId,
              updatedBy: createdBy,
            },
          });

          updated++;
          return;
        }

        if (targetUserId) {
          const user = await tx.user.update({
            where: { id: targetUserId },
            data: {
              email,
              updatedBy: createdBy,
            },
            select: { id: true },
          });

          await tx.account.upsert({
            where: { userId: user.id },
            update: {
              title,
              firstName,
              lastName,
              phone,
              updatedBy: createdBy,
            },
            create: {
              userId: user.id,
              title,
              firstName,
              lastName,
              phone,
              createdBy,
            },
          });

          if (existingStudent) {
            await tx.student.update({
              where: { id: existingStudent.id },
              data: {
                studentId,
                classroomId: resolvedClassroomId,
                programId: resolvedProgramId,
                departmentId: resolvedDepartmentId,
                levelId: resolvedLevelId,
                updatedBy: createdBy,
              },
            });
          } else {
            await tx.student.create({
              data: {
                userId: user.id,
                studentId,
                classroomId: resolvedClassroomId,
                programId: resolvedProgramId,
                departmentId: resolvedDepartmentId,
                levelId: resolvedLevelId,
                createdBy,
              },
            });
          }

          updated++;
          return;
        }

        const hashedPassword = await import("bcryptjs").then((m) =>
          m.hash(studentId, 10)
        );

        const user = await tx.user.create({
          data: {
            username: studentId,
            password: hashedPassword,
            role: Role.Student,
            email,
            createdBy,
          },
        });

        await tx.account.create({
          data: {
            userId: user.id,
            title,
            firstName,
            lastName,
            phone,
            createdBy,
          },
        });

        await tx.student.create({
          data: {
            userId: user.id,
            studentId,
            classroomId: resolvedClassroomId,
            programId: resolvedProgramId,
            departmentId: resolvedDepartmentId,
            levelId: resolvedLevelId,
            createdBy,
          },
        });
      });

      success++;
    } catch (error) {
      importErrors.push({
        row: rowNumber,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    total: rows.length + countUniqueRows(errors),
    success,
    updated,
    failed: countUniqueRows(importErrors),
    errors: importErrors,
  };
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

  const { rows, errors } = parseXLSX<Record<string, unknown>>(buffer, schema);

  if (rows.length === 0 && errors.length === 0) {
    throw new BadRequestError("ไม่พบข้อมูลครูในไฟล์ กรุณากรอกข้อมูลอย่างน้อย 1 แถว");
  }

  let success = 0;
  const importErrors: Array<{ row: number; message: string }> = errors.map((error) => ({
    row: error.row,
    message: `${error.column}: ${error.message}`,
  }));

  for (const { row: rowNumber, data: row } of rows) {
    try {
      const teacherId = row.teacherId as string;

      const existingUser = await prisma.user.findFirst({
        where: { username: teacherId },
      });

      if (existingUser) {
        importErrors.push({ row: rowNumber, message: `รหัสครู ${teacherId} มีอยู่แล้ว` });
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
        row: rowNumber,
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
