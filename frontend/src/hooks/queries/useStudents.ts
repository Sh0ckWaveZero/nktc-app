import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface StudentQuery {
  q?: string;
  fullName?: string;
  studentId?: string;
  classroomId?: string;
}

/**
 * Hook to fetch students list
 */
export const useStudents = (params?: StudentQuery, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/list`, {
        params,
      });
      return data;
    },
    enabled: options?.enabled ?? true, // Allow conditional fetching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to search students
 */
export const useStudentsSearch = (params?: StudentQuery, options?: { enabled?: boolean }) => {
  // Only enable query when there's actual search input (unless explicitly disabled)
  const hasSearchQuery = !!(params?.q || params?.fullName || params?.studentId);
  const enabled = options?.enabled !== undefined ? options.enabled && hasSearchQuery : hasSearchQuery;

  return useQuery({
    queryKey: queryKeys.students.search(params),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/search`, {
        params,
      });
      // Handle different response formats
      // API may return { success, statusCode, message, data: [...], meta } or array directly
      if (Array.isArray(data)) {
      return data;
      }
      if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch student by ID
 */
export const useStudent = (studentId: string) => {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/profile/${studentId}`);
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to update student profile
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, params }: { studentId: string; params: any }) => {
      const { data } = await httpClient.put(`${authConfig.studentEndpoint}/profile/${studentId}`, params);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(variables.studentId) });
    },
  });
};

/**
 * Hook to create student profile
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, params }: { userId: string; params: any }) => {
      const { data } = await httpClient.post(`${authConfig.studentEndpoint}/profile/${userId}`, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
};

/**
 * Hook to delete student
 */
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      return await httpClient.delete(`${authConfig.studentEndpoint}/profile/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
};

/**
 * Hook to fetch student trophy overview
 */
export const useStudentTrophyOverview = (studentId: string) => {
  return useQuery({
    queryKey: queryKeys.students.trophy(studentId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/trophy-overview/${studentId}`);
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};
