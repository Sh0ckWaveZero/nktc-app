import { useQuery } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

export interface TermStatisticsParams {
  startDate: string;
  endDate: string;
  academicYear?: string;
  departmentId?: string;
  programId?: string;
}

export interface TermStatisticsScope {
  totalStudents: number;
  totalTeachers: number;
  departmentId?: string;
  departmentName?: string | null;
  programId?: string;
  programName?: string | null;
}

export interface StudentCheckInTotals {
  present: number;
  absent: number;
  late: number;
  leave: number;
  internship: number;
}

export interface StudentCheckInStats {
  totalStudents: number;
  totalCheckInDays: number;
  checkedRecords: number;
  studentsCheckedIn: number;
  studentsNotCheckedIn: number;
  averageAttendanceRate: number;
  checkInPercentage: number;
  notCheckedInPercentage: number;
  totals: StudentCheckInTotals;
}

export interface TeacherActivityDetail {
  teacherDbId: string;
  teacherId: string;
  teacherName: string;
  department: string | null;
  program: string | null;
  checkInCount: number;
  lastCheckInDate: string | null;
  isActive: boolean;
}

export interface TeacherUsageStats {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  activePercentage: number;
  inactivePercentage: number;
  teacherActivityDetails: TeacherActivityDetail[];
}

export interface DailyChartDatum {
  date: string;
  attendanceRate: number;
  checkedRecords: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  internship: number;
}

export interface DailyBreakdownDatum extends DailyChartDatum {
  totalStudents: number;
}

export interface TermStatisticsResponse {
  summary: {
    dateRange: {
      startDate: string;
      endDate: string;
    };
    scope: TermStatisticsScope;
  };
  studentCheckInStats: StudentCheckInStats;
  teacherUsageStats: TeacherUsageStats;
  dailyChartData: DailyChartDatum[];
  dailyBreakdown: DailyBreakdownDatum[];
}

/**
 * Hook to fetch term statistics with React Query
 */
export const useTermStatistics = (params: TermStatisticsParams) => {
  return useQuery({
    queryKey: queryKeys.statistics.term(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
        ...(params.academicYear && { academicYear: params.academicYear }),
        ...(params.departmentId && params.departmentId !== 'all' && { departmentId: params.departmentId }),
        ...(params.programId && params.programId !== 'all' && { programId: params.programId }),
      });

      const { data } = await httpClient.get<TermStatisticsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/statistics/term?${queryParams.toString()}`
      );

      return data;
    },
    enabled: !!(params.startDate && params.endDate),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
