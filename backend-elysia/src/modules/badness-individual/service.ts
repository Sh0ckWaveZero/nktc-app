import { prisma } from "@/libs/prisma";
import { userMinimalSelect } from "@/libs/prisma/userSelectExclude";

export abstract class BadnessService {
  static async getByStudent(
    studentId: string,
    skip: number = 0,
    take: number = 20,
  ) {
    const [data, total] = await Promise.all([
      prisma.badnessIndividual.findMany({
        where: { studentId },
        skip,
        take,
        orderBy: { badDate: "desc" },
      }),
      prisma.badnessIndividual.count({ where: { studentId } }),
    ]);
    return { data, total, skip, take };
  }

  static async create(data: any) {
    const { badDate, studentId, studentKey, classroomId, createdBy, updatedBy, ...rest } = data;
    const resolvedStudentKey = studentKey ?? studentId;
    return prisma.badnessIndividual.create({
      data: {
        ...rest,
        studentId,
        badDate: badDate ? new Date(badDate) : new Date(),
        student: { connect: { id: resolvedStudentKey } },
        ...(classroomId ? { classroom: { connect: { id: classroomId } } } : {}),
        ...(createdBy ? { createdBy } : {}),
        ...(updatedBy ? { updatedBy } : {}),
      },
    });
  }

  static async createMany(records: any[]) {
    return prisma.badnessIndividual.createMany({
      data: records.map(({ badDate, ...rest }: any) => ({
        ...rest,
        badDate: badDate ? new Date(badDate) : new Date(),
      })),
    });
  }

  static async search(params: {
    classroomId?: string;
    studentId?: string;
    fullName?: string;
    badDate?: string | Date;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
  }) {
    const {
      classroomId,
      studentId,
      fullName,
      badDate,
      startDate,
      endDate,
      skip = 0,
      take = 50,
    } = params;

    // Build where clause
    const where: any = {};

    // Filter by student ID
    if (studentId) {
      where.studentId = studentId;
    }

    // Filter by classroom ID
    if (classroomId) {
      where.classroomId = classroomId;
    }

    // Filter by badDate (specific date)
    if (badDate) {
      const date = new Date(badDate);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.badDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate || endDate) {
      // Filter by date range
      where.badDate = {};
      if (startDate) {
        where.badDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.badDate.lte = new Date(endDate);
      }
    }

    // Filter by student name
    if (fullName) {
      where.student = {
        user: {
          account: {
            OR: [
              { firstName: { contains: fullName, mode: "insensitive" } },
              { lastName: { contains: fullName, mode: "insensitive" } },
            ],
          },
        },
      };
    }

    const records = await prisma.badnessIndividual.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                account: {
                  select: {
                    title: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        classroom: true,
      },
      orderBy: { badDate: "desc" },
    });

    // Group by student and summarize scores
    const studentMap = new Map();
    for (const record of records) {
      const key = record.studentId;

      if (!studentMap.has(key)) {
        const account = record.student?.user?.account;
        const title = account?.title ?? '';
        const firstName = account?.firstName ?? '';
        const lastName = account?.lastName ?? '';
        const name = record.classroom?.name ?? '';

        studentMap.set(key, {
          id: record.studentId,
          studentId: record.studentId,
          fullName: `${title}${firstName} ${lastName}`.trim(),
          name: name,
          badnessScore: 0,
          info: [],
        });
      }

      const student = studentMap.get(key);
      student.badnessScore += record.badnessScore || 0;
      student.info.push({
        id: record.id,
        badnessDetail: record.badnessDetail,
        badnessScore: record.badnessScore,
        badDate: record.badDate,
        image: record.image,
      });
    }

    // Convert map to array and sort by score
    const summarizedStudents = Array.from(studentMap.values()).sort(
      (a, b) => b.badnessScore - a.badnessScore
    );

    // Get total count
    const total = await prisma.badnessIndividual.count({ where });

    return {
      data: summarizedStudents,
      total,
    };
  }

  static async summary(params: {
    classroomId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { classroomId, startDate, endDate } = params;
    const records = await prisma.badnessIndividual.findMany({
      where: {
        ...(classroomId ? { classroomId } : {}),
        ...(startDate || endDate
          ? {
              badDate: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
      include: {
        student: {
          include: {
            user: { select: userMinimalSelect },
            classroom: true,
          },
        },
      },
    });
    const totalScore = records.reduce((s, r) => s + (r.badnessScore ?? 0), 0);
    return { total: records.length, totalScore, records };
  }

  static async delete(id: string) {
    await prisma.badnessIndividual.delete({ where: { id } });
  }
}
