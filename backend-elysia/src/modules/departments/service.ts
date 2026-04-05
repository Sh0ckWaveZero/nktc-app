import { prisma } from "@/libs/prisma";
import { BadRequestError, ConflictError, NotFoundError } from "@/libs/errors";
import { departmentInclude } from "./model";
import * as XLSX from "xlsx";

export abstract class DepartmentService {
  static async getAll() {
    return prisma.department.findMany({
      include: departmentInclude,
      orderBy: [{ name: "asc" }, { departmentId: "asc" }],
    });
  }

  static async getById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: departmentInclude,
    });

    if (!department) {
      throw new NotFoundError("Department not found");
    }

    return department;
  }

  static async create(data: {
    name: string;
    departmentId: string;
    description?: string;
    status?: string;
    createdBy?: string;
  }) {
    const payload = this.normalizePayload(data, {
      requireDepartmentId: true,
    });
    await this.ensureUnique(payload);

    return prisma.department.create({
      data: {
        ...payload,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
      include: departmentInclude,
    });
  }

  static async update(
    id: string,
    data: {
      name?: string;
      departmentId?: string;
      description?: string;
      status?: string;
      updatedBy?: string;
    },
  ) {
    const currentDepartment = await this.getById(id);

    if (
      data.departmentId !== undefined &&
      data.departmentId.trim() !== (currentDepartment.departmentId ?? "")
    ) {
      throw new BadRequestError("ไม่สามารถแก้ไขรหัสแผนกได้", "departmentId");
    }

    const payload = this.normalizePayload({
      ...data,
      departmentId: undefined,
    });
    await this.ensureUnique(payload, id);

    return prisma.department.update({
      where: { id },
      data: {
        ...payload,
        updatedBy: data.updatedBy,
      },
      include: departmentInclude,
    });
  }

  static async delete(id: string) {
    const department = await this.getById(id);
    const linkedRecords =
      department._count.teacher +
      department._count.student +
      department._count.program +
      department._count.classroom;

    if (linkedRecords > 0) {
      throw new BadRequestError(
        "ไม่สามารถลบแผนกที่ยังมีข้อมูลครู นักเรียน สาขา หรือห้องเรียนเชื่อมอยู่",
      );
    }

    await prisma.department.delete({ where: { id } });
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
      "รหัสแผนก*": "departmentId",
      "ชื่อแผนก*": "name",
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

        if (!record.departmentId) {
          errors.push({
            row: rowNumber,
            message: "กรุณากรอกรหัสแผนก",
          });
          continue;
        }

        if (!record.name) {
          errors.push({
            row: rowNumber,
            message: "กรุณากรอกชื่อแผนก",
          });
          continue;
        }

        const normalizedStatus = this.normalizeStatus(record.status);

        const existingDepartment = await prisma.department.findFirst({
          where: { departmentId: record.departmentId },
          select: { id: true },
        });

        const conflictingName = await prisma.department.findFirst({
          where: {
            name: {
              equals: record.name,
              mode: "insensitive",
            },
            ...(existingDepartment
              ? { NOT: { id: existingDepartment.id } }
              : {}),
          },
          select: { id: true },
        });

        if (conflictingName) {
          errors.push({
            row: rowNumber,
            message: `ชื่อแผนก ${record.name} มีอยู่แล้ว`,
          });
          continue;
        }

        if (existingDepartment) {
          await prisma.department.update({
            where: { id: existingDepartment.id },
            data: {
              name: record.name,
              description: record.description || null,
              status: normalizedStatus,
              updatedBy: userId,
            },
          });
          imported++;
          updated++;
          continue;
        }

        await prisma.department.create({
          data: {
            departmentId: record.departmentId,
            name: record.name,
            description: record.description || null,
            status: normalizedStatus,
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
    const headers = [["รหัสแผนก*", "ชื่อแผนก*", "คำอธิบาย", "สถานะ"]];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "แผนกวิชา");
    return XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;
  }

  private static normalizePayload(
    data: {
      name?: string;
      departmentId?: string;
      description?: string;
      status?: string;
    },
    options?: { requireDepartmentId?: boolean },
  ) {
    const normalizedName = data.name?.trim();
    const normalizedDepartmentId = data.departmentId?.trim();
    const normalizedDescription = data.description?.trim();
    const normalizedStatus =
      "status" in data ? this.normalizeStatus(data.status) : undefined;

    if ("name" in data && !normalizedName) {
      throw new BadRequestError("กรุณากรอกชื่อแผนก", "name");
    }

    if (options?.requireDepartmentId && !normalizedDepartmentId) {
      throw new BadRequestError("กรุณากรอกรหัสแผนก", "departmentId");
    }

    return {
      ...(normalizedName !== undefined ? { name: normalizedName } : {}),
      ...(normalizedDepartmentId !== undefined
        ? { departmentId: normalizedDepartmentId || null }
        : {}),
      ...(normalizedDescription !== undefined
        ? { description: normalizedDescription || null }
        : {}),
      ...(normalizedStatus !== undefined
        ? { status: normalizedStatus || null }
        : {}),
    };
  }

  private static async ensureUnique(
    data: {
      name?: string;
      departmentId?: string | null;
    },
    excludeId?: string,
  ) {
    if (data.departmentId) {
      const existingDepartmentCode = await prisma.department.findFirst({
        where: {
          departmentId: data.departmentId,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });

      if (existingDepartmentCode) {
        throw new ConflictError("รหัสแผนกนี้ถูกใช้งานแล้ว", "departmentId");
      }
    }

    if (data.name) {
      const existingDepartmentName = await prisma.department.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });

      if (existingDepartmentName) {
        throw new ConflictError("ชื่อแผนกนี้มีอยู่แล้ว", "name");
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
