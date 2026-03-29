import { prisma } from "@/libs/prisma";
import { teacherInclude, type TeacherModel } from "./model";
import { userMinimalSelect } from "@/libs/prisma/userSelectExclude";
import { hash } from "bcrypt";
import { ConflictError } from "@/libs/errors";
import { Role } from "../../../generated/client";
import { createLogger } from "@/infrastructure/logging";

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
  static async search(q?: string) {
    log.info("[TeacherService] search", { query: q });
    const result = await prisma.teacher.findMany({
      where: q
        ? {
            OR: [
              { teacherId: { contains: q, mode: "insensitive" } },
              {
                user: {
                  username: { contains: q, mode: "insensitive" },
                },
              },
              {
                user: {
                  account: { firstName: { contains: q, mode: "insensitive" } },
                },
              },
              {
                user: {
                  account: { lastName: { contains: q, mode: "insensitive" } },
                },
              },
            ],
          }
        : undefined,
      include: teacherInclude,
    });
    log.debug("[TeacherService] search result", { count: result.length });
    return result.map(stripSensitive);
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

    const result = await prisma.$transaction(async (tx) => {
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
      const updated = await tx.teacher.findUnique({
        where: { id },
        include: teacherInclude,
      });
      log.info("[TeacherService] updateProfile success", { id });
      return updated ? stripSensitive(updated) : null;
    });

    return result;
  }

  static async updateClassrooms(id: string, classrooms: string[]) {
    log.info("[TeacherService] updateClassrooms", {
      id,
      classroomCount: classrooms?.length || 0,
    });

    const result = await prisma.$transaction(async (tx) => {
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
      const updated = await tx.teacher.findUnique({
        where: { id },
        include: teacherInclude,
      });
      log.info("[TeacherService] updateClassrooms success", {
        id,
        added: classrooms?.length || 0,
      });
      return updated ? stripSensitive(updated) : null;
    });

    return result;
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

    const result = await prisma.$transaction(async (tx) => {
      const assignments = await tx.teacherOnClassroom.findMany({
        where: { teacherId },
        select: { classroomId: true },
      });
      const classroomIds = assignments.map((a) => a.classroomId);

      const [classrooms, students] = await Promise.all([
        tx.classroom.findMany({
          where: { id: { in: classroomIds } },
          include: {
            program: true,
            department: true,
            level: true,
          },
        }),
        tx.student.findMany({
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
    });

    return result;
  }
}
