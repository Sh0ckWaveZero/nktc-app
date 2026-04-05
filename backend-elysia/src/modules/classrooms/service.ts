import { prisma } from "@/libs/prisma";
import { classroomInclude } from "./model";
import * as XLSX from "xlsx";
import { BadRequestError, ConflictError, NotFoundError } from "@/libs/errors";

export abstract class ClassroomService {
  static async getAll() {
    return prisma.classroom.findMany({
      include: classroomInclude,
      orderBy: { name: "asc" },
    });
  }

  static async create(data: {
    classroomId: string;
    name: string;
    description?: string;
    programId?: string;
    departmentId?: string;
    levelId?: string;
    status?: string;
    createdBy?: string;
  }) {
    const payload = await this.normalizePayload(data, {
      requireClassroomId: true,
    });
    await this.ensureUnique(payload);
    return prisma.classroom.create({
      data: {
        ...payload,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
      include: classroomInclude,
    });
  }

  static async getById(id: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: classroomInclude,
    });

    if (!classroom) {
      throw new NotFoundError("Classroom not found");
    }

    return classroom;
  }

  static async getByTeacher(teacherId: string) {
    const assignments = await prisma.teacherOnClassroom.findMany({
      where: { teacherId },
      select: { classroomId: true },
    });
    const classroomIds = assignments.map((a) => a.classroomId);
    return prisma.classroom.findMany({
      where: { id: { in: classroomIds } },
      include: classroomInclude,
    });
  }

  static async search(params: {
    departmentId?: string;
    programId?: string;
    levelId?: string;
    name?: string;
  }) {
    const { departmentId, programId, levelId, name } = params;
    return prisma.classroom.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(programId ? { programId } : {}),
        ...(levelId ? { levelId } : {}),
        ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
      },
      include: classroomInclude,
      orderBy: { name: "asc" },
    });
  }

  static async delete(id: string) {
    const classroom = await this.getById(id);
    const linkedRecords =
      classroom._count.student +
      classroom._count.teachers +
      classroom._count.course +
      classroom._count.reportCheckIn +
      classroom._count.activityCheckInReport +
      classroom._count.levelClassrooms;

    if (linkedRecords > 0) {
      throw new BadRequestError("ไม่สามารถลบห้องเรียนที่ยังมีข้อมูลเชื่อมอยู่");
    }

    await prisma.classroom.delete({ where: { id } });
  }

  static async update(
    id: string,
    data: {
      classroomId?: string;
      name?: string;
      description?: string;
      programId?: string;
      departmentId?: string;
      levelId?: string;
      status?: string;
      updatedBy?: string;
    },
  ) {
    const currentClassroom = await this.getById(id);

    if (
      data.classroomId !== undefined &&
      data.classroomId.trim() !== (currentClassroom.classroomId ?? "")
    ) {
      throw new BadRequestError(
        "ไม่สามารถแก้ไขรหัสห้องเรียนได้",
        "classroomId",
      );
    }

    const payload = await this.normalizePayload({
      ...data,
      classroomId: undefined,
    });
    await this.ensureUnique(payload, id);

    return prisma.classroom.update({
      where: { id },
      data: {
        ...payload,
        updatedBy: data.updatedBy,
      },
      include: classroomInclude,
    });
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
      "รหัสห้องเรียน*": "classroomId",
      "ชื่อห้องเรียน*": "name",
      รหัสสาขา: "programCode",
      รหัสแผนก: "departmentCode",
      รหัสระดับ: "levelCode",
      คำอธิบาย: "description",
      สถานะ: "status",
    };

    let imported = 0;
    let updated = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;
      try {
        const record: Record<string, string> = {};
        for (const [xlsxCol, dbField] of Object.entries(schema)) {
          const value = row[xlsxCol];
          if (typeof value === "string") {
            record[dbField] = value.trim();
          }
        }

        if (!record.classroomId) {
          errors.push({ row: rowNumber, message: "กรุณากรอกรหัสห้องเรียน" });
          continue;
        }

        if (!record.name) {
          errors.push({ row: rowNumber, message: "กรุณากรอกชื่อห้องเรียน" });
          continue;
        }

        const [existingClassroom, program, department, level] =
          await Promise.all([
            prisma.classroom.findFirst({
              where: { classroomId: record.classroomId },
              select: { id: true },
            }),
            record.programCode
              ? prisma.program.findFirst({
                  where: { programId: record.programCode },
                  select: { id: true, departmentId: true, levelId: true },
                })
              : Promise.resolve(null),
            record.departmentCode
              ? prisma.department.findFirst({
                  where: { departmentId: record.departmentCode },
                  select: { id: true },
                })
              : Promise.resolve(null),
            record.levelCode
              ? prisma.level.findFirst({
                  where: { levelId: record.levelCode },
                  select: { id: true },
                })
              : Promise.resolve(null),
          ]);

        if (record.programCode && !program) {
          errors.push({
            row: rowNumber,
            message: `ไม่พบรหัสสาขา ${record.programCode}`,
          });
          continue;
        }

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

        const resolvedDepartmentId =
          department?.id ?? program?.departmentId ?? undefined;
        const resolvedLevelId = level?.id ?? program?.levelId ?? undefined;
        const normalizedStatus = this.normalizeStatus(record.status);

        const conflictingName = await prisma.classroom.findFirst({
          where: {
            name: {
              equals: record.name,
              mode: "insensitive",
            },
            ...(existingClassroom ? { NOT: { id: existingClassroom.id } } : {}),
          },
          select: { id: true },
        });

        if (conflictingName) {
          errors.push({
            row: rowNumber,
            message: `ชื่อห้องเรียน ${record.name} มีอยู่แล้ว`,
          });
          continue;
        }

        if (existingClassroom) {
          await prisma.classroom.update({
            where: { id: existingClassroom.id },
            data: {
              name: record.name,
              description: record.description || null,
              programId: program?.id ?? null,
              departmentId: resolvedDepartmentId ?? null,
              levelId: resolvedLevelId ?? null,
              status: normalizedStatus,
              updatedBy: userId,
            },
          });
          imported++;
          updated++;
          continue;
        }

        await prisma.classroom.create({
          data: {
            classroomId: record.classroomId,
            name: record.name,
            description: record.description || null,
            programId: program?.id ?? null,
            departmentId: resolvedDepartmentId ?? null,
            levelId: resolvedLevelId ?? null,
            status: normalizedStatus,
            createdBy: userId,
            updatedBy: userId,
          },
        });
        imported++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : "Unknown error",
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
      [
        "รหัสห้องเรียน*",
        "ชื่อห้องเรียน*",
        "รหัสสาขา",
        "รหัสแผนก",
        "รหัสระดับ",
        "คำอธิบาย",
        "สถานะ",
      ],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "ห้องเรียน");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  private static async normalizePayload(
    data: {
      classroomId?: string;
      name?: string;
      description?: string;
      programId?: string;
      departmentId?: string;
      levelId?: string;
      status?: string;
    },
    options?: { requireClassroomId?: boolean },
  ) {
    const normalizedClassroomId = data.classroomId?.trim();
    const normalizedName = data.name?.trim();
    const normalizedDescription = data.description?.trim();
    const normalizedProgramId = data.programId?.trim();
    const normalizedDepartmentId = data.departmentId?.trim();
    const normalizedLevelId = data.levelId?.trim();
    const normalizedStatus =
      "status" in data ? this.normalizeStatus(data.status) : undefined;
    let resolvedDepartmentId = normalizedDepartmentId;
    let resolvedLevelId = normalizedLevelId;

    if ("name" in data && !normalizedName) {
      throw new BadRequestError("กรุณากรอกชื่อห้องเรียน", "name");
    }

    if (options?.requireClassroomId && !normalizedClassroomId) {
      throw new BadRequestError("กรุณากรอกรหัสห้องเรียน", "classroomId");
    }

    if (normalizedProgramId) {
      const program = await prisma.program.findUnique({
        where: { id: normalizedProgramId },
        select: { id: true, departmentId: true, levelId: true },
      });
      if (!program) {
        throw new BadRequestError("ไม่พบสาขาวิชาที่เลือก", "programId");
      }
      if (
        normalizedDepartmentId &&
        program.departmentId &&
        program.departmentId !== normalizedDepartmentId
      ) {
        throw new BadRequestError(
          "แผนกไม่ตรงกับสาขาวิชาที่เลือก",
          "departmentId",
        );
      }
      if (
        normalizedLevelId &&
        program.levelId &&
        program.levelId !== normalizedLevelId
      ) {
        throw new BadRequestError(
          "ระดับชั้นไม่ตรงกับสาขาวิชาที่เลือก",
          "levelId",
        );
      }

      resolvedDepartmentId =
        normalizedDepartmentId || program.departmentId || undefined;
      resolvedLevelId = normalizedLevelId || program.levelId || undefined;
    }

    if (resolvedDepartmentId) {
      const department = await prisma.department.findUnique({
        where: { id: resolvedDepartmentId },
        select: { id: true },
      });
      if (!department) {
        throw new BadRequestError("ไม่พบแผนกที่เลือก", "departmentId");
      }
    }

    if (resolvedLevelId) {
      const level = await prisma.level.findUnique({
        where: { id: resolvedLevelId },
        select: { id: true },
      });
      if (!level) {
        throw new BadRequestError("ไม่พบระดับชั้นที่เลือก", "levelId");
      }
    }

    return {
      ...(normalizedClassroomId !== undefined
        ? { classroomId: normalizedClassroomId }
        : {}),
      ...(normalizedName !== undefined ? { name: normalizedName } : {}),
      ...(normalizedDescription !== undefined
        ? { description: normalizedDescription || null }
        : {}),
      ...(normalizedProgramId !== undefined
        ? { programId: normalizedProgramId || null }
        : {}),
      ...(resolvedDepartmentId !== undefined
        ? { departmentId: resolvedDepartmentId || null }
        : {}),
      ...(resolvedLevelId !== undefined
        ? { levelId: resolvedLevelId || null }
        : {}),
      ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}),
    };
  }

  private static async ensureUnique(
    data: {
      classroomId?: string;
      name?: string;
    },
    excludeId?: string,
  ) {
    if (data.classroomId) {
      const existingClassroomCode = await prisma.classroom.findFirst({
        where: {
          classroomId: data.classroomId,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (existingClassroomCode) {
        throw new ConflictError("รหัสห้องเรียนนี้ถูกใช้งานแล้ว", "classroomId");
      }
    }

    if (data.name) {
      const existingClassroomName = await prisma.classroom.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (existingClassroomName) {
        throw new ConflictError("ชื่อห้องเรียนนี้มีอยู่แล้ว", "name");
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
