import { describe, expect, it } from 'vitest';

import type { AdminVisitSummaryRow } from '@/hooks/queries/useVisits';

import { buildAdminVisitOverview } from '../admin-home.utils';

describe('buildAdminVisitOverview', () => {
  it('deduplicates student population by advisor scope across multiple visit dates', () => {
    const rows: AdminVisitSummaryRow[] = [
      {
        id: 'row-1',
        teacherName: 'ครูหนึ่ง',
        visitDate: '2026-05-20',
        latestRecordedAt: '2026-05-20',
        departmentName: 'ไฟฟ้า',
        classroomName: 'ปวช.1/1',
        recordedStudentCount: 10,
        studentCount: 25,
      },
      {
        id: 'row-2',
        teacherName: 'ครูหนึ่ง',
        visitDate: '2026-05-25',
        latestRecordedAt: '2026-05-25',
        departmentName: 'ไฟฟ้า',
        classroomName: 'ปวช.1/1',
        recordedStudentCount: 12,
        studentCount: 25,
      },
      {
        id: 'row-3',
        teacherName: 'ครูสอง',
        visitDate: '2026-05-21',
        latestRecordedAt: '2026-05-21',
        departmentName: 'ช่างยนต์',
        classroomName: 'ปวช.2/1',
        recordedStudentCount: 9,
        studentCount: 30,
      },
    ];

    const overview = buildAdminVisitOverview(rows, 4);

    expect(overview.totalRows).toBe(3);
    expect(overview.totalStudentPopulation).toBe(55);
    expect(overview.uniqueTeachers).toBe(2);
    expect(overview.teacherCoverageRate).toBe(50);
    expect(overview.latestRecordedAt).toBe('2026-05-25');
  });

  it('returns zeros when there is no visit report data', () => {
    expect(buildAdminVisitOverview([], 0)).toEqual({
      latestRecordedAt: null,
      teacherCoverageRate: 0,
      totalRows: 0,
      totalStudentPopulation: 0,
      uniqueTeachers: 0,
    });
  });
});