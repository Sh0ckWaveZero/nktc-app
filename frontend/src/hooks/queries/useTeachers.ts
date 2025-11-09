import { useQuery } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface TeacherQuery {
  q?: string;
  search?: string;
  firstName?: string;
  lastName?: string;
  departmentId?: string;
  [key: string]: any;
}

/**
 * Hook to fetch teachers list
 */
export const useTeachers = (params?: TeacherQuery) => {
  return useQuery({
    queryKey: queryKeys.teachers.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(authConfig.teacherEndpoint as string, {
        params,
      });

      // Handle different response formats:
      // 1. { success, statusCode, message, data: [...] }
      // 2. { data: [...] }
      // 3. Array directly

      if (Array.isArray(data)) {
        return data;
      }

      if (data && typeof data === 'object') {
        // Check for nested structure: { success, data: [...] }
        if ('success' in data && 'data' in data && Array.isArray(data.data)) {
          return data.data;
        }
        // Check for direct structure: { data: [...] }
        if ('data' in data && Array.isArray(data.data)) {
          return data.data;
        }
      }

      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch students by teacher ID
 * Returns classrooms and their students for a specific teacher
 */
export const useTeacherStudents = (teacherId: string) => {
  return useQuery({
    queryKey: queryKeys.teachers.students(teacherId),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.teacherEndpoint}/${teacherId}/students`
      );

      // Handle nested response structure: { data: { data: { classrooms: [...] } } }
      let actualData = data;
      if (data?.data) {
        actualData = data.data;
        // If still nested, go one level deeper
        if (actualData?.data) {
          actualData = actualData.data;
        }
      }

      return actualData;
    },
    enabled: !!teacherId, // Only run when teacherId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests 2 times
  });
};

