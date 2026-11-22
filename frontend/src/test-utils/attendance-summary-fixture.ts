import type { AttendanceSummary } from '@/types/apps/attendance-summary';

/** สร้าง Fixture แบบมีตัวหารและยอดรวมสอดคล้องกันสำหรับทดสอบ Dashboard */
export const createAttendanceSummaryFixture = (): AttendanceSummary => {
  const first = { present: 30, absent: 10, late: 10, leave: 5, internship: 5, total: 60, punctualityRate: 60 };
  const second = { present: 40, absent: 5, late: 5, leave: 5, internship: 5, total: 60, punctualityRate: 80 };
  return {
    period: {
      academicYear: 2569,
      term: 2,
      name: 'ภาคเรียนที่ 2/2569',
      startDate: '2026-10-26',
      endDate: '2027-02-28',
      throughDate: '2026-11-08',
      hasStarted: true,
    },
    totals: { present: 70, absent: 15, late: 15, leave: 10, internship: 10, total: 120, punctualityRate: 70 },
    uniqueStudents: 12,
    recordedDays: 10,
    classroomsCount: 2,
    weekly: [
      { week: 1, startDate: '2026-10-26', endDate: '2026-11-01', ...first, uniqueStudents: 12, recordedDays: 5 },
      { week: 2, startDate: '2026-11-02', endDate: '2026-11-08', ...second, uniqueStudents: 12, recordedDays: 5 },
    ],
    departments: [
      { id: 'dept-a', name: 'แผนกช่างยนต์', ...first, uniqueStudents: 6, recordedDays: 10, classroomsCount: 1 },
      { id: 'dept-b', name: 'แผนกบัญชี', ...second, uniqueStudents: 6, recordedDays: 10, classroomsCount: 1 },
    ],
    classrooms: [
      {
        id: 'room-a',
        name: 'ปวช.1/1',
        departmentName: 'แผนกช่างยนต์',
        levelName: 'ปวช.',
        ...first,
        uniqueStudents: 6,
        recordedDays: 10,
      },
      {
        id: 'room-b',
        name: 'ปวส.1/1',
        departmentName: 'แผนกบัญชี',
        levelName: 'ปวส.',
        ...second,
        uniqueStudents: 6,
        recordedDays: 10,
      },
    ],
    quality: { sourceReports: 20, duplicateEntries: 2, conflictingStudentDays: 0, invalidEntries: 0 },
    generatedAt: '2026-11-08T08:00:00Z',
  };
};
