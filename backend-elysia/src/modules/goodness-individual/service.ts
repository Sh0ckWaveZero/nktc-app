import { prisma } from "@/libs/prisma";
import { userMinimalSelect } from "@/libs/prisma/userSelectExclude";

// Helper function to search students by full name using raw query
async function findStudentsByFullName(
  searchTerm: string,
): Promise<{ id: string }[]> {
  // Remove extra spaces and normalize
  const normalized = searchTerm.trim().replace(/\s+/g, " ");

  // Split into terms: "ขุนแผน โพธิ์ใจยัง" → ["ขุนแผน", "โพธิ์ใจยัง"]
  const terms = normalized.split(" ").filter((term) => term.length > 0);

  if (terms.length === 0) {
    return [];
  }

  // Smart matching:
  // - If 1 term: search in firstName OR lastName OR studentId
  // - If 2+ terms: first term → firstName, remaining terms → lastName
  let conditions: string;

  if (terms.length === 1) {
    // Single term: search anywhere
    conditions = `(a."firstName" ILIKE '%${terms[0]}%' OR a."lastName" ILIKE '%${terms[0]}%' OR s."studentId" ILIKE '%${terms[0]}%')`;
  } else {
    const firstNameTerm = terms[0];
    const lastNameTerms = terms.slice(1);

    conditions = `(
      a."firstName" ILIKE '%${firstNameTerm}%'
      AND a."lastName" ILIKE '%${lastNameTerms}%'
    ) OR (
      s."studentId" ILIKE '%${normalized}%'
    )`;
  }

  const result = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT DISTINCT s.id FROM student s
     LEFT JOIN "user" u ON s."userId" = u.id
     LEFT JOIN accounts a ON u.id = a."userId"
     WHERE ${conditions}
     LIMIT 50`,
  );

  return result;
}

export abstract class GoodnessService {
  static async getByStudent(
    studentId: string,
    skip: number = 0,
    take: number = 20,
  ) {
    const [data, total] = await Promise.all([
      prisma.goodnessIndividual.findMany({
        where: { studentId },
        skip,
        take,
        orderBy: { goodDate: "desc" },
      }),
      prisma.goodnessIndividual.count({ where: { studentId } }),
    ]);
    return { data, total, skip, take };
  }

  static async create(data: any) {
    const { goodDate, studentId, studentKey, ...rest } = data;
    return prisma.goodnessIndividual.create({
      data: {
        ...rest,
        studentId,
        studentKey,
        goodDate: goodDate ? new Date(goodDate) : new Date(),
      },
    });
  }

  static async createMany(records: any[]) {
    return prisma.goodnessIndividual.createMany({
      data: records.map(({ goodDate, ...rest }: any) => ({
        ...rest,
        goodDate: goodDate ? new Date(goodDate) : new Date(),
      })),
    });
  }

  static async search(params: {
    classroomId?: string;
    studentId?: string;
    fullName?: string;
    goodDate?: string;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
  }) {
    const {
      classroomId,
      studentId,
      fullName,
      goodDate,
      startDate,
      endDate,
      skip = 0,
      take = 50,
    } = params;

    // Build where clause
    const whereClause: any = {};

    // Filter by classroom
    if (classroomId) {
      whereClause.classroomId = classroomId;
    }

    // Filter by specific student ID
    if (studentId) {
      whereClause.studentId = studentId;
    }

    // Filter by date
    // Support both goodDate (single date) and startDate/endDate (range)
    if (goodDate) {
      // Single date filter - exact match
      whereClause.goodDate = new Date(goodDate);
    } else if (startDate || endDate) {
      // Date range filter
      whereClause.goodDate = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    // If fullName is provided, we need to search students first
    if (fullName && !studentId) {
      // Use raw query to search students by full name (supports "firstName lastName" search)
      const students = await findStudentsByFullName(fullName);

      if (students.length > 0) {
        whereClause.studentId = { in: students.map((s) => s.id) };
      } else {
        // If no students found, return empty result
        return [];
      }
    }

    return prisma.goodnessIndividual.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        student: {
          include: {
            user: { select: userMinimalSelect },
            classroom: true,
          },
        },
      },
      orderBy: { goodDate: "desc" },
    });
  }

  static async summary(params: {
    classroomId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { classroomId, startDate, endDate } = params;
    const records = await prisma.goodnessIndividual.findMany({
      where: {
        ...(classroomId ? { classroomId } : {}),
        ...(startDate || endDate
          ? {
              goodDate: {
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
    const totalScore = records.reduce((s, r) => s + (r.goodnessScore ?? 0), 0);
    return { total: records.length, totalScore, records };
  }

  static async delete(id: string) {
    await prisma.goodnessIndividual.delete({ where: { id } });
  }
}
