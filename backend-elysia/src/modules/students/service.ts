import { prisma } from "@/libs/prisma";
import { studentInclude, StudentModel } from "./model";
import { importStudentsFromXLSX, generateStudentTemplate } from "@/libs/xlsx";
import { NotFoundError } from "@/libs/errors";

export abstract class StudentService {
  static async getList(skip: number = 0, take: number = 20) {
    const data = await prisma.student.findMany({
      skip,
      take,
      include: studentInclude,
      orderBy: { studentId: "asc" },
    });
    const total = await prisma.student.count();
    return { data, total, skip, take };
  }

  static async search(params: StudentModel["searchParams"]) {
    const { q, classroomId, departmentId, programId } = params;
    return prisma.student.findMany({
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
  }

  static async searchWithParams(params: StudentModel["searchParams"]) {
    const {
      classroomId,
      q,
      search,
      skip = 0,
      take = 20,
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
    return { data, total };
  }

  static async getById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: studentInclude,
    });
    if (!student) {
      throw new NotFoundError("Student not found");
    }
    return student;
  }

  static async create(userId: string, data: StudentModel["createBody"]) {
    const { graduationDate, ...rest } = data;
    return prisma.student.create({
      data: {
        ...rest,
        graduationDate: graduationDate
          ? new Date(graduationDate as any)
          : graduationDate === null
            ? null
            : undefined,
        userId,
      },
      include: studentInclude,
    });
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
    return await prisma.student.findUnique({
      where: { id },
      include: studentInclude,
    });
  }

  static async delete(id: string) {
    await prisma.student.delete({ where: { id } });
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

  static generateTemplate() {
    return generateStudentTemplate();
  }

  static async importFromXLSX(fileBase64: string, userId: string) {
    const buffer = Buffer.from(fileBase64, "base64");
    return importStudentsFromXLSX(buffer, userId);
  }
}
