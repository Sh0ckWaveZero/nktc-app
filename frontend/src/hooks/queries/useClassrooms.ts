import { useQuery } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface ClassroomQuery {
  q?: string;
  departmentId?: string;
  programId?: string;
}

/**
 * Hook to fetch classrooms list
 */
export const useClassrooms = (params?: ClassroomQuery) => {
  return useQuery({
    queryKey: queryKeys.classrooms.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(authConfig.classroomEndpoint as string, {
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
 * Hook to fetch teacher's assigned classrooms with students
 * This endpoint returns only classrooms assigned to the teacher
 */
export const useTeacherClassrooms = (teacherId: string) => {
  return useQuery({
    queryKey: queryKeys.classrooms.list({ teacherId }),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.teacherEndpoint}/${teacherId}/classrooms-and-students`
      );

      // Returns array of classrooms with students: [{ id, name, students: [], ... }]
      if (Array.isArray(data)) {
        return data;
      }

      if (data && typeof data === 'object') {
        if ('success' in data && 'data' in data && Array.isArray(data.data)) {
          return data.data;
        }
        if ('data' in data && Array.isArray(data.data)) {
          return data.data;
        }
      }

      return [];
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch classroom by ID
 */
export const useClassroom = (classroomId: string) => {
  return useQuery({
    queryKey: queryKeys.classrooms.detail(classroomId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.classroomEndpoint}/${classroomId}`);
      return data;
    },
    enabled: !!classroomId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch classroom students
 */
export const useClassroomStudents = (classroomId: string) => {
  return useQuery({
    queryKey: queryKeys.classrooms.students(classroomId),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.classroomEndpoint}/${classroomId}/students`
      );
      return data;
    },
    enabled: !!classroomId,
    staleTime: 5 * 60 * 1000,
  });
};
