import { prisma } from "@/libs/prisma";
import { programInclude } from "./model";
import { BadRequestError, ConflictError, NotFoundError } from "@/libs/errors";
import * as XLSX from "xlsx";

export abstract class ProgramService {
  static async getAll() {
    return prisma.program.findMany({
      include: programInclude,
      orderBy: { name: "asc" },
    });
  }

  static async getById(id: string) {
    const program = await prisma.program.findUnique({
      where: { id },
      include: programInclude,
    });
    if (!program) {
      throw new NotFoundError("Program not found");
    }
    return program;
  }

  static async create(data: {
    programId: string;
    name: string;
    description?: string;
    departmentId?: string;
    levelId?: string;
    status?: string;
    createdBy?: string;
  }) {
    const payload = await this.normalizePayload(data, {
      requireProgramId: true,
    });
    await this.ensureUnique(payload);
    return prisma.program.create({
      data: {
        ...payload,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
      include: programInclude,
    });
  }

  static async update(
    id: string,
    data: {
      programId?: string;
      name?: string;
      description?: string;
      departmentId?: string;
      levelId?: string;
      status?: string;
      updatedBy?: string;
    },
  ) {
    const currentProgram = await this.getById(id);
    if (
      data.programId !== undefined &&
      data.programId.trim() !== currentProgram.programId
    ) {
      throw new BadRequestError("ไม่สามารถแก้ไขรหัสสาขาได้", "programId");
    }

    const payload = await this.normalizePayload({
      ...data,
      programId: undefined,
    });
    await this.ensureUnique(payload, id);

    return prisma.program.update({
      where: { id },
      data: {
        ...payload,
        updatedBy: data.updatedBy,
      },
      include: programInclude,
    });
  }

  static async delete(id: string) {
    const program = await this.getById(id);
    const linkedRecords =
      program._count.student +
      program._count.classroom +
      program._count.teacher +
      program._count.course +
      program._count.levelClassroom;

    if (linkedRecords > 0) {
      throw new BadRequestError(
        "ไม่สามารถลบสาขาที่ยังมีข้อมูลนักเรียน ครู ห้องเรียน หรือรายวิชาเชื่อมอยู่",
      );
    }

    await prisma.program.delete({ where: { id } });
  }

  static async importFromXLSX(fileBase64: string, userId: string) {
    const buffer = Buffer.from(fileBase64, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      raw: false,
      defval: "",
    });

    if (rows.length === 0) {
      throw new BadRequestError(
        "ไม่พบข้อมูลสำหรับนำเข้า กรุณากรอกข้อมูลอย่างน้อย 1 แถว",
      );
    }

    const schema: Record<string, string> = {
      "รหัสสาขา*": "programId",
      "ชื่อสาขา*": "name",
      รหัสแผนก: "departmentCode",
      รหัสระดับ: "levelCode",
      คำอธิบาย: "description",
      สถานะ: "status",
    };

    let imported = 0;
    let updated = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNumber = index + 2;

      try {
        const record: Record<string, string> = {};
        for (const [xlsxCol, dbField] of Object.entries(schema)) {
          const value = row[xlsxCol];
          if (typeof value === "string") {
            record[dbField] = value.trim();
          }
        }

        if (!record.programId) {
          errors.push({ row: rowNumber, message: "กรุณากรอกรหัสสาขา" });
          continue;
        }

        if (!record.name) {
          errors.push({ row: rowNumber, message: "กรุณากรอกชื่อสาขา" });
          continue;
        }

        const [existingProgram, department, level] = await Promise.all([
          prisma.program.findFirst({
            where: { programId: record.programId },
            select: { id: true },
          }),
          record.departmentCode
            ? prisma.department.findFirst({
                where: { departmentId: record.departmentCode },
                select: { id: true, name: true },
              })
            : Promise.resolve(null),
          record.levelCode
            ? prisma.level.findFirst({
                where: { levelId: record.levelCode },
                select: { id: true, levelName: true },
              })
            : Promise.resolve(null),
        ]);

        if (record.departmentCode && !department) {
          errors.push({
            row: rowNumber,
            message: `ไม่พบรหัสแผนก ${record.departmentCode}`,
          });
          continue;
        }

        if (record.levelCode && !level) {
          errors.push({
            row: rowNumber,
            message: `ไม่พบรหัสระดับ ${record.levelCode}`,
          });
          continue;
        }

        const conflictingName = await prisma.program.findFirst({
          where: {
            name: {
              equals: record.name,
              mode: "insensitive",
            },
            ...(existingProgram ? { NOT: { id: existingProgram.id } } : {}),
          },
          select: { id: true },
        });

        if (conflictingName) {
          errors.push({
            row: rowNumber,
            message: `ชื่อสาขา ${record.name} มีอยู่แล้ว`,
          });
          continue;
        }

        const normalizedStatus = this.normalizeStatus(record.status);

        if (existingProgram) {
          await prisma.program.update({
            where: { id: existingProgram.id },
            data: {
              name: record.name,
              description: record.description || null,
              status: normalizedStatus,
              departmentId: department?.id ?? null,
              levelId: level?.id ?? null,
              updatedBy: userId,
            },
          });
          imported++;
          updated++;
          continue;
        }

        await prisma.program.create({
          data: {
            programId: record.programId,
            name: record.name,
            description: record.description || null,
            status: normalizedStatus,
            departmentId: department?.id,
            levelId: level?.id,
            createdBy: userId,
            updatedBy: userId,
          },
        });
        imported++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          message:
            error instanceof Error ? error.message : "Unknown import error",
        });
      }
    }

    const failed = errors.length;
    const created = imported - updated;

    return {
      success: failed === 0,
      message:
        imported === 0
          ? `นำเข้าได้ 0 จาก ${rows.length} รายการ`
          : `สำเร็จ ${imported} รายการ (เพิ่มใหม่ ${created} / อัปเดต ${updated})`,
      total: rows.length,
      imported,
      updated,
      failed,
      errors,
    };
  }

  static generateTemplate(): Buffer {
    const headers = [
      ["รหัสสาขา*", "ชื่อสาขา*", "รหัสแผนก", "รหัสระดับ", "คำอธิบาย", "สถานะ"],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "สาขาวิชา");
    return XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;
  }

  private static async normalizePayload(
    data: {
      programId?: string;
      name?: string;
      description?: string;
      departmentId?: string;
      levelId?: string;
      status?: string;
    },
    options?: { requireProgramId?: boolean },
  ) {
    const normalizedProgramId = data.programId?.trim();
    const normalizedName = data.name?.trim();
    const normalizedDescription = data.description?.trim();
    const normalizedDepartmentId = data.departmentId?.trim();
    const normalizedLevelId = data.levelId?.trim();
    const normalizedStatus =
      "status" in data ? this.normalizeStatus(data.status) : undefined;

    if ("name" in data && !normalizedName) {
      throw new BadRequestError("กรุณากรอกชื่อสาขา", "name");
    }

    if (options?.requireProgramId && !normalizedProgramId) {
      throw new BadRequestError("กรุณากรอกรหัสสาขา", "programId");
    }

    if (normalizedDepartmentId) {
      const department = await prisma.department.findUnique({
        where: { id: normalizedDepartmentId },
        select: { id: true },
      });
      if (!department) {
        throw new BadRequestError("ไม่พบแผนกที่เลือก", "departmentId");
      }
    }

    if (normalizedLevelId) {
      const level = await prisma.level.findUnique({
        where: { id: normalizedLevelId },
        select: { id: true },
      });
      if (!level) {
        throw new BadRequestError("ไม่พบระดับชั้นที่เลือก", "levelId");
      }
    }

    return {
      ...(normalizedProgramId !== undefined
        ? { programId: normalizedProgramId }
        : {}),
      ...(normalizedName !== undefined ? { name: normalizedName } : {}),
      ...(normalizedDescription !== undefined
        ? { description: normalizedDescription || null }
        : {}),
      ...(normalizedDepartmentId !== undefined
        ? { departmentId: normalizedDepartmentId || null }
        : {}),
      ...(normalizedLevelId !== undefined
        ? { levelId: normalizedLevelId || null }
        : {}),
      ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
    };
  }

  private static async ensureUnique(
    data: {
      programId?: string;
      name?: string;
    },
    excludeId?: string,
  ) {
    if (data.programId) {
      const existingProgramCode = await prisma.program.findFirst({
        where: {
          programId: data.programId,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (existingProgramCode) {
        throw new ConflictError("รหัสสาขานี้ถูกใช้งานแล้ว", "programId");
      }
    }

    if (data.name) {
      const existingProgramName = await prisma.program.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (existingProgramName) {
        throw new ConflictError("ชื่อสาขานี้มีอยู่แล้ว", "name");
      }
    }
  }

  private static normalizeStatus(status?: string) {
    const normalizedStatus = status?.trim();
    if (!normalizedStatus) {
      return "active";
    }
    if (normalizedStatus === "active" || normalizedStatus === "เปิดใช้งาน") {
      return "active";
    }
    if (normalizedStatus === "inactive" || normalizedStatus === "ปิดใช้งาน") {
      return "inactive";
    }
    throw new BadRequestError(
      "สถานะต้องเป็น active, inactive, เปิดใช้งาน หรือ ปิดใช้งาน",
      "status",
    );
  }
}
