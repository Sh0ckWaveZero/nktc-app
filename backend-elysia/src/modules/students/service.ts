import { prisma } from "@/libs/prisma";
import { studentInclude, StudentModel } from "./model";
import { importStudentsFromXLSX, generateStudentTemplate } from "@/libs/xlsx";
import { ConflictError, NotFoundError } from "@/libs/errors";
import { Prisma, Role } from "../../../generated/client";

const maskIdCard = (idCard?: string | null) => {
  if (!idCard) return idCard ?? null;
  const digits = idCard.replace(/\D/g, "");

  if (digits.length !== 13) {
    return idCard;
  }

  return `x-xxxx-xxxxx-x-${digits.slice(-2)}`;
};

const maskStudentSensitiveFields = <
  T extends {
    user?: {
      account?: {
        idCard?: string | null;
      } | null;
    } | null;
  },
>(
  student: T,
): T => ({
  ...student,
  user: student.user
    ? {
        ...student.user,
        account: student.user.account
          ? {
              ...student.user.account,
              idCard: maskIdCard(student.user.account.idCard),
            }
          : student.user.account,
      }
    : student.user,
});

export abstract class StudentService {
  static async getList(skip: number = 0, take: number = 20) {
    const data = await prisma.student.findMany({
      skip,
      take,
      include: studentInclude,
      orderBy: { studentId: "asc" },
    });
    const total = await prisma.student.count();
    return { data: data.map(maskStudentSensitiveFields), total, skip, take };
  }

  static async search(params: StudentModel["searchParams"]) {
    const { q, classroomId, departmentId, programId } = params;
    const students = await prisma.student.findMany({
      where: {
        ...(classroomId ? { classroomId } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(programId ? { programId } : {}),
        ...(q
          ? {
              OR: [
                { studentId: { contains: q, mode: "insensitive" as const } },
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
          : {}),
      },
      include: studentInclude,
      orderBy: { studentId: "asc" },
    });
    return students.map(maskStudentSensitiveFields);
  }

  static async searchWithParams(params: StudentModel["searchParams"]) {
    const {
      classroomId,
      q,
      search,
      skip = 0,
      take = 1000,
      departmentId,
      programId,
    } = params;

    // Support both q (from GET) and search object (from POST)
    const searchQuery = q || search?.studentId || search?.fullName;
    const searchConditions: any[] = [];

    if (searchQuery) {
      searchConditions.push({ studentId: { contains: searchQuery, mode: "insensitive" as const } });

      // If searchQuery has a space, it might be "firstName lastName"
      const nameParts = searchQuery.split(' ').filter(p => !!p);
      if (nameParts.length > 1) {
        searchConditions.push({
          user: {
            account: {
              AND: [
                { firstName: { contains: nameParts[0], mode: "insensitive" as const } },
                { lastName: { contains: nameParts[1], mode: "insensitive" as const } },
              ]
            }
          }
        });
      } else {
        searchConditions.push({
          user: {
            account: {
              firstName: { contains: searchQuery, mode: "insensitive" as const },
            },
          },
        });
        searchConditions.push({
          user: {
            account: {
              lastName: { contains: searchQuery, mode: "insensitive" as const },
            },
          },
        });
      }
    }

    const whereCondition = {
      ...(classroomId ? { classroomId } : {}),
      ...(departmentId ? { departmentId } : {}),
      ...(programId ? { programId } : {}),
      ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
    };

    const data = await prisma.student.findMany({
      where: whereCondition,
      skip,
      take,
      include: studentInclude,
      orderBy: { studentId: "asc" },
    });

    const total = await prisma.student.count({
      where: whereCondition,
    });
    return { data: data.map(maskStudentSensitiveFields), total };
  }

  static async getById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: studentInclude,
    });
    if (!student) {
      throw new NotFoundError("Student not found");
    }
    return maskStudentSensitiveFields(student);
  }

  static async create(createdBy: string, data: StudentModel["createBody"]) {
    const {
      graduationDate, studentId,
      title, firstName, lastName, idCard, phone, birthDate,
      addressLine1, subdistrict, district, province, postcode, avatar, email,
      ...studentData
    } = data;

    // Check if studentId is already taken
    const existingStudentId = await prisma.student.findUnique({
      where: { studentId },
      select: { id: true },
    });
    if (existingStudentId) {
      throw new ConflictError('รหัสนักเรียนนี้มีอยู่ในระบบแล้ว');
    }

    // Check if username (studentId) already taken by another account
    const existingUser = await prisma.user.findFirst({
      where: { username: studentId },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictError('รหัสนักเรียนนี้ถูกใช้เป็นบัญชีผู้ใช้แล้ว');
    }

    try {
      const hashedPassword = await import("bcryptjs").then((m) => m.hash(studentId, 10));

      const student = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: studentId,
            password: hashedPassword,
            role: Role.Student,
            email: email || null,
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
            idCard,
            phone,
            birthDate: birthDate ? new Date(birthDate as any) : null,
            addressLine1,
            subdistrict,
            district,
            province,
            postcode,
            avatar,
            createdBy,
          },
        });

        return tx.student.create({
          data: {
            ...studentData,
            studentId,
            graduationDate: graduationDate
              ? new Date(graduationDate as any)
              : graduationDate === null
                ? null
                : undefined,
            userId: user.id,
            createdBy,
          },
          include: studentInclude,
        });
      });

      return maskStudentSensitiveFields(student);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictError('รหัสนักเรียนนี้มีอยู่ในระบบแล้ว');
      }
      throw err;
    }
  }

  static async update(id: string, data: StudentModel["updateBody"]) {
    const { account, ...studentData } = data;

    await prisma.$transaction(async (tx) => {
      const currentStudent = await tx.student.findUnique({
        where: { id },
        select: { userId: true, classroomId: true },
      });

      if (account && currentStudent?.userId) {
        const { birthDate, ...accountUpdateData } = account;
        await tx.account.update({
          where: { userId: currentStudent.userId },
          data: {
            ...accountUpdateData,
            birthDate: birthDate
              ? new Date(birthDate as any)
              : birthDate === null
                ? null
                : undefined,
          },
        });
      }

      // If classroomId provided and it's different from current, sync other IDs
      let extraData = {};
      if (
        studentData.classroomId &&
        studentData.classroomId !== currentStudent?.classroomId
      ) {
        const classroom = await tx.classroom.findUnique({
          where: { id: studentData.classroomId },
          select: { departmentId: true, programId: true, levelId: true },
        });
        if (classroom) {
          extraData = {
            departmentId: classroom.departmentId,
            programId: classroom.programId,
            levelId: classroom.levelId,
          };
        }
      }

      await tx.student.update({
        where: { id },
        data: {
          ...studentData,
          graduationDate: studentData.graduationDate
            ? new Date(studentData.graduationDate as any)
            : studentData.graduationDate === null
              ? null
              : undefined,
          ...extraData,
        },
      });
    });

    // Fetch the full student data outside the transaction or after updates finish
    // to avoid complex parallel queries on the transaction connection
    const student = await prisma.student.findUnique({
      where: { id },
      include: studentInclude,
    });
    return student ? maskStudentSensitiveFields(student) : student;
  }

  static async delete(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!student) throw new NotFoundError("Student not found");

    await prisma.$transaction(async (tx) => {
      await tx.goodnessIndividual.deleteMany({ where: { studentKey: id } });
      await tx.badnessIndividual.deleteMany({ where: { studentKey: id } });
      await tx.visitStudent.deleteMany({ where: { studentKey: id } });

      if (student.userId) {
        await tx.user.delete({ where: { id: student.userId } });
      } else {
        await tx.student.delete({ where: { id } });
      }
    });
  }

  static async getTrophyOverview(id: string) {
    const goodness = await prisma.goodnessIndividual.aggregate({
      where: { studentId: id },
      _sum: { goodnessScore: true },
      _count: true,
    });
    const badness = await prisma.badnessIndividual.aggregate({
      where: { studentId: id },
      _sum: { badnessScore: true },
      _count: true,
    });
    return {
      goodnessScore: goodness._sum.goodnessScore ?? 0,
      goodnessCount: goodness._count,
      badnessScore: badness._sum.badnessScore ?? 0,
      badnessCount: badness._count,
      netScore:
        (goodness._sum.goodnessScore ?? 0) - (badness._sum.badnessScore ?? 0),
    };
  }

  static async getClassroomTeachers(classroomId: string) {
    const assignments = await prisma.teacherOnClassroom.findMany({
      where: { classroomId },
      select: { teacherId: true },
    });
    const teacherIds = assignments.map((a) => a.teacherId);
    return prisma.teacher.findMany({
      where: { id: { in: teacherIds } },
      include: {
        user: {
          include: {
            account: {
              select: {
                title: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  static async promotePreview(sourceClassroomId: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: sourceClassroomId },
      select: { name: true },
    });

    if (!classroom) throw new NotFoundError("ไม่พบห้องเรียนต้นทาง");

    const students = await prisma.student.findMany({
      where: {
        classroomId: sourceClassroomId,
        OR: [{ studentStatus: { not: "จบการศึกษา" } }, { studentStatus: null }],
      },
      select: {
        id: true,
        studentId: true,
        user: {
          select: {
            account: {
              select: { firstName: true, lastName: true, title: true },
            },
          },
        },
      },
      orderBy: { studentId: "asc" },
    });

    return {
      classroomName: classroom.name,
      total: students.length,
      students: students.map((s) => ({
        id: s.id,
        studentId: s.studentId,
        name: [s.user?.account?.title, s.user?.account?.firstName, s.user?.account?.lastName]
          .filter(Boolean)
          .join(" ") || s.studentId || "-",
      })),
    };
  }

  static async promoteClassroom(sourceClassroomId: string, targetClassroomId: string, promotedBy: string) {
    const [source, target] = await Promise.all([
      prisma.classroom.findUnique({
        where: { id: sourceClassroomId },
        select: { id: true, name: true, classroomId: true },
      }),
      prisma.classroom.findUnique({
        where: { id: targetClassroomId },
        select: { id: true, name: true, classroomId: true, departmentId: true, programId: true, levelId: true },
      }),
    ]);

    if (!source) throw new NotFoundError("ไม่พบห้องเรียนต้นทาง");
    if (!target) throw new NotFoundError("ไม่พบห้องเรียนปลายทาง");
    if (sourceClassroomId === targetClassroomId) {
      throw new Error("ห้องเรียนต้นทางและปลายทางต้องไม่เหมือนกัน");
    }

    const { count } = await prisma.student.updateMany({
      where: {
        classroomId: sourceClassroomId,
        OR: [{ studentStatus: { not: "จบการศึกษา" } }, { studentStatus: null }],
      },
      data: {
        classroomId: targetClassroomId,
        departmentId: target.departmentId,
        programId: target.programId,
        levelId: target.levelId,
        updatedBy: promotedBy,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "PROMOTE_CLASSROOM",
        model: "Student",
        detail: `เลื่อนชั้นนักเรียน ${count} คน จาก "${source.name}" → "${target.name}"`,
        oldValue: source.classroomId ?? source.id,
        newValue: target.classroomId ?? target.id,
        createdBy: promotedBy,
      },
    });

    return {
      promoted: count,
      sourceClassroom: source.name,
      targetClassroom: target.name,
    };
  }

  static generateTemplate() {
    return generateStudentTemplate();
  }

  static async importFromXLSX(fileBase64: string, userId: string) {
    const buffer = Buffer.from(fileBase64, "base64");
    return importStudentsFromXLSX(buffer, userId);
  }
}
