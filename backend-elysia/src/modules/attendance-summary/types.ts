interface AttendanceCounts {
  present: number;
  absent: number;
  late: number;
  leave: number;
  internship: number;
  total: number;
  punctualityRate: number | null;
}

interface AttendanceGroup extends AttendanceCounts {
  uniqueStudents: number;
  recordedDays: number;
}

export interface AttendanceSummary {
  period: {
    academicYear: number;
    term: 1 | 2;
    name: string;
    startDate: string;
    endDate: string;
    throughDate: string;
    hasStarted: boolean;
  };
  totals: AttendanceCounts;
  uniqueStudents: number;
  recordedDays: number;
  classroomsCount: number;
  weekly: (AttendanceGroup & {
    week: number;
    startDate: string;
    endDate: string;
  })[];
  departments: (AttendanceGroup & {
    id: string;
    name: string;
    classroomsCount: number;
  })[];
  classrooms: (AttendanceGroup & {
    id: string;
    name: string;
    departmentName: string;
    levelName: string;
  })[];
  quality: {
    sourceReports: number;
    duplicateEntries: number;
    conflictingStudentDays: number;
    invalidEntries: number;
  };
  generatedAt: string;
}
