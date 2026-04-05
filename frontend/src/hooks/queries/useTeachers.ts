import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export interface TeacherImportError {
  row: number;
  message: string;
}

export interface TeacherImportResult {
  success: boolean;
  message: string;
  total: number;
  imported: number;
  updated: number;
  failed: number;
  errors: TeacherImportError[];
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
 * Hook to fetch classrooms and students by teacher ID
 * Returns classrooms with nested students for a specific teacher
 */
export const useTeacherStudents = (teacherId: string) => {
  return useQuery({
    queryKey: queryKeys.teachers.students(teacherId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/classrooms-and-students`);

      // Handle nested response structure: { data: [...] } or array directly
      let classrooms = data;
      if (data?.data) {
        classrooms = data.data;
        if (classrooms?.data) {
          classrooms = classrooms.data;
        }
      }

      return { classrooms: Array.isArray(classrooms) ? classrooms : [] };
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useImportTeachers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: string }) => {
      const { data } = await httpClient.post(`${authConfig.teacherEndpoint}/upload`, { file });
      return data as TeacherImportResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
};
