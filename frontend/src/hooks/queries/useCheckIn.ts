import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

/**
 * Hook to fetch teacher classrooms and students for check-in
 */
export const useTeacherClassroomsAndStudents = (teacherId: string) => {
  return useQuery({
    queryKey: [teacherId, 'teacher-classrooms-students'],
    queryFn: async () => {
      const response = await httpClient.get(
        `${authConfig.teacherEndpoint}/${teacherId}/classrooms-and-students`
      );
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
export const useCheckInReports = (params?: {
  teacherId?: string;
  classroomId?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.checkIn.report(params || {}),
    queryFn: async () => {
      if (!params?.teacherId || !params?.classroomId) {
        return null;
      }

      // แนบ date เป็น query string เพื่อกรองเฉพาะวันที่ต้องการ
      const dateParam = params.date ? `?date=${params.date}` : '';
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/teacher/${params.teacherId}/classroom/${params.classroomId}${dateParam}`
      );
      return data;
    },
    enabled: !!(params?.teacherId && params?.classroomId),
    staleTime: 60 * 1000, // ลดเหลือ 1 นาที เพื่อ reflect การบันทึกใหม่ได้เร็วขึ้น
  });
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
export const useActivityCheckInReports = (params?: {
  classroomId?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: ['activity-check-in', params],
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.activityCheckInEndpoint}`, {
        params,
      });
      return data;
    },
    enabled: !!(params?.classroomId),
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
