import type { AdminVisitSummaryRow } from '@/hooks/queries/useVisits';

export interface AdminVisitOverview {
  latestRecordedAt: string | null;
  teacherCoverageRate: number;
  totalRows: number;
  totalStudentPopulation: number;
  uniqueTeachers: number;
}

const buildAdvisorScopeKey = (row: AdminVisitSummaryRow) => `${row.teacherName}:${row.departmentName}:${row.classroomName}`;

export const buildAdminVisitOverview = (
  rows: AdminVisitSummaryRow[],
  totalTeachers: number,
): AdminVisitOverview => {
  const studentPopulationByAdvisorScope = new Map<string, number>();
  const teacherNames = new Set<string>();

  let latestRecordedAt: string | null = null;

  rows.forEach((row) => {
    const recordedAt = row.latestRecordedAt ?? row.visitDate;

    if (row.teacherName) {
      teacherNames.add(row.teacherName);
    }

    const advisorScopeKey = buildAdvisorScopeKey(row);

    if (!studentPopulationByAdvisorScope.has(advisorScopeKey)) {
      studentPopulationByAdvisorScope.set(advisorScopeKey, row.studentCount);
    }

    if (!latestRecordedAt || recordedAt > latestRecordedAt) {
      latestRecordedAt = recordedAt;
    }
  });

  const totalStudentPopulation = [...studentPopulationByAdvisorScope.values()].reduce(
    (sum, studentCount) => sum + studentCount,
    0,
  );

  return {
    latestRecordedAt,
    teacherCoverageRate: totalTeachers > 0 ? Math.round((teacherNames.size / totalTeachers) * 100) : 0,
    totalRows: rows.length,
    totalStudentPopulation,
    uniqueTeachers: teacherNames.size,
  };
};