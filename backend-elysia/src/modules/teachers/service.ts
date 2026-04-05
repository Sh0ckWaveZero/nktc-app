import { prisma } from "@/libs/prisma";
import { teacherInclude, type TeacherModel } from "./model";
import { userMinimalSelect } from "@/libs/prisma/userSelectExclude";
import { hash } from "bcrypt";
import { BadRequestError, ConflictError } from "@/libs/errors";
import { Role } from "../../../generated/client";
import { createLogger } from "@/infrastructure/logging";
import * as XLSX from "xlsx";

const log = createLogger();

const stripSensitive = (teacher: any) => {
  const { user, classrooms, ...rest } = teacher;
  return {
    ...rest,
    user: user
      ? (() => {
          const { password, accessToken, refreshToken, expiresAt, ...u } = user;
          return u;
        })()
      : user,
    teacherOnClassroom: classrooms?.map((c: any) => c.classroomId) || [],
    classroomNames:
      classrooms?.map((c: any) => c.classroom?.name).filter(Boolean) || [],
    classrooms,
  };
};

export abstract class TeacherService {
  static async search(params: TeacherModel["searchQuery"]) {
    const { q, skip = 0, take = 20 } = params;
    log.info("[TeacherService] search", { query: q, skip, take });

    const whereCondition = q
      ? {
          OR: [
            { teacherId: { contains: q, mode: "insensitive" as const } },
            {
              user: {
                username: { contains: q, mode: "insensitive" as const },
              },
            },
            {
              user: {
                account: {
                  firstName: { contains: q, mode: "insensitive" as const },
                },
              },
            },
            {
              user: {
                account: {
                  lastName: { contains: q, mode: "insensitive" as const },
                },
              },
            },
          ],
        }
      : undefined;

    const data = await prisma.teacher.findMany({
      where: whereCondition,
      skip,
      take,
      include: teacherInclude,
    });

    const total = await prisma.teacher.count({
      where: whereCondition,
    });

    log.debug("[TeacherService] search result", { count: data.length, total });
    return {
      data: data.map(stripSensitive),
      total,
    };
  }

  static async create(data: TeacherModel["createBody"]) {
    const { user, teacher } = data;
    const hashedPassword = await hash(teacher.password || "password123", 12);

    let status = teacher.status || "Active";
    if (status === "true") status = "Active";
    if (status === "false") status = "Inactive";

    try {
      const existingUser = await prisma.user.findUnique({
        where: { username: teacher.username },
      });
      if (existingUser) {
        log.warn("[TeacherService] create - duplicate username", {
          username: teacher.username,
        });
        throw new ConflictError("Username already exists", "username");
      }

      const result = await prisma.user.create({
        data: {
          username: teacher.username,
          password: hashedPassword,
          email: teacher.email || null,
          role: (teacher.role || "Teacher") as Role,
          status: status,
          createdBy: user?.id || "system",
          updatedBy: user?.id || "system",
          account: {
            create: {
              title: teacher.title || null,
              firstName: teacher.firstName || "",
              lastName: teacher.lastName || "",
              idCard: teacher.idCard || null,
              birthDate: teacher.birthDate ? new Date(teacher.birthDate) : null,
              createdBy: user?.id || "system",
              updatedBy: user?.id || "system",
            },
          },
          teacher: {
            create: {
              jobTitle: teacher.jobTitle || null,
              academicStanding: teacher.academicStanding || null,
              status: status,
              createdBy: user?.id || "system",
              updatedBy: user?.id || "system",
            },
          },
        },
        include: {
          account: true,
          teacher: true,
        },
      });
      log.info("[TeacherService] create success", { userId: result.id });
      return { id: result.id, teacherId: result.teacher?.id };
    } catch (error) {
      throw error;
    }
  }

  static async update(id: string, data: TeacherModel["updateBody"]) {
    const { user, teacher, account } = data;
    log.info("[TeacherService] update", { id });

    await prisma.$transaction(async (tx) => {
      if (teacher && account?.id) {
        await tx.account.update({
          where: { id: account.id },
          data: {
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            title: teacher.title,
            idCard: teacher.idCard || null,
            birthDate: teacher.birthDate || null,
            updatedBy: user?.id,
          },
        });
        log.debug("[TeacherService] update - account updated", {
          accountId: account.id,
        });
      }

      await tx.teacher.update({
        where: { id },
        data: {
          jobTitle: teacher?.jobTitle,
          status: teacher?.status,
        },
      });
    });

    const result = await prisma.teacher.findUnique({
      where: { id },
      include: teacherInclude,
    });
    log.info("[TeacherService] update success", { id });
    return result ? stripSensitive(result) : null;
  }

  static async delete(id: string) {
    log.info("[TeacherService] delete", { id });

    await prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (teacher?.userId) {
        await tx.user.delete({ where: { id: teacher.userId } });
        log.info("[TeacherService] delete success - deleted user", {
          userId: teacher.userId,
        });
      } else {
        await tx.teacher.delete({ where: { id } });
        log.info("[TeacherService] delete success - deleted teacher", { id });
      }
    });
  }

  static async updateProfile(id: string, data: any) {
    log.info("[TeacherService] updateProfile", { id });

    await prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (teacher?.userId) {
        await tx.account.update({
          where: { userId: teacher.userId },
          data,
        });
        log.debug("[TeacherService] updateProfile - account updated", {
          userId: teacher.userId,
        });
      }
    });

    const updated = await prisma.teacher.findUnique({
      where: { id },
      include: teacherInclude,
    });
    log.info("[TeacherService] updateProfile success", { id });
    return updated ? stripSensitive(updated) : null;
  }

  static async updateClassrooms(id: string, classrooms: string[]) {
    log.info("[TeacherService] updateClassrooms", {
      id,
      classroomCount: classrooms?.length || 0,
    });

    await prisma.$transaction(async (tx) => {
      await tx.teacherOnClassroom.deleteMany({
        where: { teacherId: id },
      });
      if (classrooms?.length) {
        await tx.teacherOnClassroom.createMany({
          data: classrooms.map((classroomId) => ({
            teacherId: id,
            classroomId,
          })),
        });
      }
      await tx.teacher.update({
        where: { id },
        data: {
          classroomIds: classrooms || [],
        },
      });
    });

    const updated = await prisma.teacher.findUnique({
      where: { id },
      include: teacherInclude,
    });
    log.info("[TeacherService] updateClassrooms success", {
      id,
      added: classrooms?.length || 0,
    });
    return updated ? stripSensitive(updated) : null;
  }

  static async getStudents(teacherId: string) {
    log.info("[TeacherService] getStudents", { teacherId });
    try {
      const assignments = await prisma.teacherOnClassroom.findMany({
        where: { teacherId },
        select: { classroomId: true },
      });
      const classroomIds = assignments.map((a) => a.classroomId);
      const result = await prisma.student.findMany({
        where: { classroomId: { in: classroomIds } },
        include: {
          user: { select: userMinimalSelect },
          classroom: true,
          program: true,
          level: true,
        },
      });
      log.debug("[TeacherService] getStudents result", {
        classroomIds,
        count: result.length,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getClassroomsWithStudents(teacherId: string) {
    log.info("[TeacherService] getClassroomsWithStudents", { teacherId });

    const assignments = await prisma.teacherOnClassroom.findMany({
      where: { teacherId },
      select: { classroomId: true },
    });
    const classroomIds = assignments.map((a) => a.classroomId);

    const [classrooms, students] = await Promise.all([
      prisma.classroom.findMany({
        where: { id: { in: classroomIds } },
        include: {
          program: true,
          department: true,
          level: true,
        },
      }),
      prisma.student.findMany({
        where: { classroomId: { in: classroomIds } },
        include: {
          user: { select: userMinimalSelect },
        },
      }),
    ]);

    const mapped = classrooms.map((c) => ({
      ...c,
      students: students.filter((s) => s.classroomId === c.id),
    }));
    log.debug("[TeacherService] getClassroomsWithStudents result", {
      classrooms: classrooms.length,
      students: students.length,
    });
    return mapped;
  }

  static generateTemplate(): Buffer {
    const headers = [
      [
        "ชื่อผู้ใช้*",
        "รหัสครู",
        "คำนำหน้า",
        "ชื่อ*",
        "นามสกุล*",
        "เลขบัตรประชาชน",
        "วันเกิด",
        "อีเมล",
        "เบอร์โทร",
        "ตำแหน่ง",
        "วิทยฐานะ",
        "สถานะ",
      ],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ครูและบุคลากร");
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  static async importFromXLSX(fileBase64: string, createdBy: string) {
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

    const schema: Record<string, string[]> = {
      username: ["ชื่อผู้ใช้*", "ชื่อผู้ใช้"],
      teacherId: ["รหัสครู*", "รหัสครู"],
      title: ["คำนำหน้า"],
      firstName: ["ชื่อ*", "ชื่อ"],
      lastName: ["นามสกุล*", "นามสกุล"],
      idCard: ["เลขบัตรประชาชน*", "เลขบัตรประชาชน", "เลขบัตร"],
      birthDate: ["วันเกิด*", "วันเกิด"],
      email: ["อีเมล*", "อีเมล", "email", "Email"],
      phone: ["เบอร์โทร*", "เบอร์โทร", "โทรศัพท์"],
      jobTitle: ["ตำแหน่ง*", "ตำแหน่ง"],
      academicStanding: ["วิทยฐานะ*", "วิทยฐานะ"],
      status: ["สถานะ*", "สถานะ"],
    };

    let imported = 0;
    let updated = 0;
    const errors: Array<{ row: number; message: string }> = [];
    const seenUsernames = new Set<string>();

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const rowNumber = index + 2;

      try {
        const record: Record<string, string> = {};

        for (const [field, columns] of Object.entries(schema)) {
          const value = columns
            .map((column) => row[column])
            .find(
              (columnValue) =>
                typeof columnValue === "string" &&
                columnValue.trim().length > 0,
            );

          if (typeof value === "string") {
            record[field] = value.trim();
          }
        }

        const username = record.username?.trim();
        const firstName = record.firstName?.trim();
        const lastName = record.lastName?.trim();

        if (!username) {
          errors.push({ row: rowNumber, message: "กรุณากรอกชื่อผู้ใช้" });
          continue;
        }

        if (!firstName) {
          errors.push({ row: rowNumber, message: "กรุณากรอกชื่อ" });
          continue;
        }

        if (!lastName) {
          errors.push({ row: rowNumber, message: "กรุณากรอกนามสกุล" });
          continue;
        }

        const normalizedUsername = username.toLowerCase();

        if (seenUsernames.has(normalizedUsername)) {
          errors.push({
            row: rowNumber,
            message: `ชื่อผู้ใช้ ${username} ซ้ำภายในไฟล์`,
          });
          continue;
        }

        seenUsernames.add(normalizedUsername);

        const normalizedTeacherId = record.teacherId?.trim() || username;
        const normalizedStatus = this.normalizeStatus(record.status);
        const birthDate = this.parseBirthDate(record.birthDate, rowNumber);
        const normalizedEmail = record.email?.trim() || null;
        const normalizedPhone = record.phone?.trim() || null;
        const normalizedIdCard = record.idCard?.trim() || null;
        const normalizedTitle = record.title?.trim() || null;
        const normalizedJobTitle = record.jobTitle?.trim() || null;
        const normalizedAcademicStanding =
          record.academicStanding?.trim() || null;

        const [existingUser, conflictingEmail, conflictingTeacherId] =
          await Promise.all([
            prisma.user.findUnique({
              where: { username },
              include: {
                account: true,
                teacher: true,
              },
            }),
            normalizedEmail
              ? prisma.user.findFirst({
                  where: {
                    email: normalizedEmail,
                    NOT: { username },
                  },
                  select: { id: true },
                })
              : Promise.resolve(null),
            prisma.teacher.findFirst({
              where: {
                teacherId: normalizedTeacherId,
                ...(username
                  ? {
                      NOT: {
                        user: {
                          username,
                        },
                      },
                    }
                  : {}),
              },
              select: { id: true },
            }),
          ]);

        if (conflictingEmail) {
          errors.push({
            row: rowNumber,
            message: `อีเมล ${normalizedEmail} ถูกใช้งานแล้ว`,
          });
          continue;
        }

        if (conflictingTeacherId) {
          errors.push({
            row: rowNumber,
            message: `รหัสครู ${normalizedTeacherId} ถูกใช้งานแล้ว`,
          });
          continue;
        }

        if (existingUser && !existingUser.teacher) {
          errors.push({
            row: rowNumber,
            message: `ชื่อผู้ใช้ ${username} มีอยู่แล้วแต่ยังไม่ผูกกับข้อมูลครู`,
          });
          continue;
        }

        if (existingUser?.teacher) {
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: existingUser.id },
              data: {
                email: normalizedEmail,
                status: normalizedStatus,
                updatedBy: createdBy,
              },
            });

            if (existingUser.account?.id) {
              await tx.account.update({
                where: { id: existingUser.account.id },
                data: {
                  title: normalizedTitle,
                  firstName,
                  lastName,
                  idCard: normalizedIdCard,
                  birthDate,
                  phone: normalizedPhone,
                  updatedBy: createdBy,
                },
              });
            } else {
              await tx.account.create({
                data: {
                  userId: existingUser.id,
                  title: normalizedTitle,
                  firstName,
                  lastName,
                  idCard: normalizedIdCard,
                  birthDate,
                  phone: normalizedPhone,
                  createdBy,
                  updatedBy: createdBy,
                },
              });
            }

            await tx.teacher.update({
              where: { id: existingUser.teacher.id },
              data: {
                teacherId: normalizedTeacherId,
                jobTitle: normalizedJobTitle,
                academicStanding: normalizedAcademicStanding,
                status: normalizedStatus,
                updatedBy: createdBy,
              },
            });
          });

          imported += 1;
          updated += 1;
          continue;
        }

        const hashedPassword = await hash(username, 12);

        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              username,
              password: hashedPassword,
              email: normalizedEmail,
              role: Role.Teacher,
              status: normalizedStatus,
              createdBy,
              updatedBy: createdBy,
            },
          });

          await tx.account.create({
            data: {
              userId: user.id,
              title: normalizedTitle,
              firstName,
              lastName,
              idCard: normalizedIdCard,
              birthDate,
              phone: normalizedPhone,
              createdBy,
              updatedBy: createdBy,
            },
          });

          await tx.teacher.create({
            data: {
              userId: user.id,
              teacherId: normalizedTeacherId,
              jobTitle: normalizedJobTitle,
              academicStanding: normalizedAcademicStanding,
              status: normalizedStatus,
              createdBy,
              updatedBy: createdBy,
            },
          });
        });

        imported += 1;
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

  private static normalizeStatus(status?: string) {
    const normalizedStatus = status?.trim().toLowerCase();

    if (!normalizedStatus) {
      return "active";
    }

    if (
      normalizedStatus === "active" ||
      normalizedStatus === "เปิดใช้งาน" ||
      normalizedStatus === "ใช้งาน"
    ) {
      return "active";
    }

    if (
      normalizedStatus === "inactive" ||
      normalizedStatus === "ปิดใช้งาน" ||
      normalizedStatus === "ไม่ใช้งาน"
    ) {
      return "inactive";
    }

    throw new BadRequestError(
      "สถานะต้องเป็น active, inactive, เปิดใช้งาน หรือ ปิดใช้งาน",
      "status",
    );
  }

  private static parseBirthDate(value?: string, rowNumber?: number) {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      return null;
    }

    const parsedDate = new Date(normalizedValue);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestError(
        `แถว ${rowNumber ?? "-"} วันเกิดไม่ถูกต้อง กรุณาใช้รูปแบบวันที่ที่ระบบอ่านได้`,
        "birthDate",
      );
    }

    return parsedDate;
  }
}
