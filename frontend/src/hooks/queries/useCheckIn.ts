import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

export interface CheckInData {
  teacherId: string;
  classroomId: string;
  checkInDate: string;
  present: string[];
  absent: string[];
  late: string[];
  leave: string[];
  internship: string[];
}

export interface AggregatedCheckInReport {
  present: string[];
  absent: string[];
  late: string[];
  leave: string[];
  internship: string[];
  totalChecked: number;
}

const buildCheckInReportUrl = (params: { teacherId: string; classroomId: string; date?: string }) => {
  const dateParam = params.date ? `?date=${params.date}` : '';
  return `${authConfig.reportCheckInEndpoint}/teacher/${params.teacherId}/classroom/${params.classroomId}${dateParam}`;
};

const fetchCheckInReport = async (params: { teacherId: string; classroomId: string; date?: string }) => {
  const { data } = await httpClient.get(buildCheckInReportUrl(params));
  return data;
};

const getCheckInIds = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
};

export const aggregateCheckInReports = (reports: readonly unknown[]): AggregatedCheckInReport => {
  const present = new Set<string>();
  const absent = new Set<string>();
  const late = new Set<string>();
  const leave = new Set<string>();
  const internship = new Set<string>();

  reports.forEach((report) => {
    const reportData =
      report && typeof report === 'object' && 'data' in report && report.data && typeof report.data === 'object'
        ? report.data
        : report;

    if (!reportData || typeof reportData !== 'object') {
      return;
    }

    const buckets = reportData as Partial<Record<keyof AggregatedCheckInReport, unknown>>;

    getCheckInIds(buckets.present).forEach((studentId) => present.add(studentId));
    getCheckInIds(buckets.absent).forEach((studentId) => absent.add(studentId));
    getCheckInIds(buckets.late).forEach((studentId) => late.add(studentId));
    getCheckInIds(buckets.leave).forEach((studentId) => leave.add(studentId));
    getCheckInIds(buckets.internship).forEach((studentId) => internship.add(studentId));
  });

  const aggregated = {
    present: [...present],
    absent: [...absent],
    late: [...late],
    leave: [...leave],
    internship: [...internship],
  };

  return {
    ...aggregated,
    totalChecked:
      aggregated.present.length +
      aggregated.absent.length +
      aggregated.late.length +
      aggregated.leave.length +
      aggregated.internship.length,
  };
};

const getStableClassroomIds = (classroomIds?: readonly string[]) =>
  Array.from(new Set((classroomIds ?? []).filter(Boolean))).sort((left, right) => left.localeCompare(right));

/**
 * Hook to fetch teacher classrooms and students for check-in
 */
export const useTeacherClassroomsAndStudents = (teacherId: string) => {
  return useQuery({
    queryKey: [teacherId, 'teacher-classrooms-students'],
    queryFn: async () => {
      const response = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/classrooms-and-students`);
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      return response.data;
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch check-in reports
 * ต้องส่ง date ไปกับ query เสมอ เพื่อกรองเฉพาะวันนั้น
 * ไม่เช่นนั้น backend จะคืนข้อมูลทุกวัน → hasSavedCheckIn เป็น true ผิดๆ
 */
export const useCheckInReports = (params?: { teacherId?: string; classroomId?: string; date?: string }) => {
  return useQuery({
    queryKey: queryKeys.checkIn.report(params || {}),
    queryFn: async () => {
      if (!params?.teacherId || !params?.classroomId) {
        return null;
      }

      return fetchCheckInReport({ teacherId: params.teacherId, classroomId: params.classroomId, date: params.date });
    },
    enabled: !!(params?.teacherId && params?.classroomId),
    staleTime: 60 * 1000, // ลดเหลือ 1 นาที เพื่อ reflect การบันทึกใหม่ได้เร็วขึ้น
  });
};

export const useCheckInReportsByClassrooms = (params?: { teacherId?: string; classroomIds?: readonly string[]; date?: string }) => {
  const classroomIds = getStableClassroomIds(params?.classroomIds);

  const results = useQueries({
    queries: classroomIds.map((classroomId) => ({
      queryKey: queryKeys.checkIn.report({ teacherId: params?.teacherId, classroomId, date: params?.date }),
      queryFn: async () => {
        if (!params?.teacherId) {
          return null;
        }

        return fetchCheckInReport({ teacherId: params.teacherId, classroomId, date: params.date });
      },
      enabled: !!(params?.teacherId && classroomId),
      staleTime: 60 * 1000,
    })),
  });

  return {
    data: aggregateCheckInReports(results.map((result) => result.data)),
    isLoading: results.some((result) => result.isLoading),
    isFetching: results.some((result) => result.isFetching),
  };
};

/**
 * Hook to save check-in data
 */
export const useSaveCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckInData) => {
      const response = await httpClient.post(`${authConfig.reportCheckInEndpoint}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate check-in queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkIn.all,
      });
      // Invalidate teacher classrooms cache
      queryClient.invalidateQueries({
        queryKey: [variables.teacherId, 'teacher-classrooms-students'],
      });
    },
  });
};

/**
 * Hook to fetch activity check-in reports
 */
export const useActivityCheckInReports = (params?: { classroomId?: string; date?: string }) => {
  return useQuery({
    queryKey: ['activity-check-in', params],
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.activityCheckInEndpoint}`, {
        params,
      });
      return data;
    },
    enabled: !!params?.classroomId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to save activity check-in data
 */
export const useSaveActivityCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await httpClient.post(`${authConfig.activityCheckInEndpoint}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['activity-check-in'],
      });
    },
  });
};
