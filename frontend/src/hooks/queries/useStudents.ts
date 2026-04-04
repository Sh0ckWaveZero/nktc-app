import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';
import type { StudentData } from '@/types/apps/studentTypes';

interface StudentQuery {
  q?: string;
  fullName?: string;
  studentId?: string;
  classroomId?: string;
}

/**
 * Unwrap API response from backend ResponseInterceptor
 * Backend wraps all responses in { success, statusCode, message, data, meta }
 */
function unwrapResponse<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return response.data as T;
  }
  return response as T;
}

/**
 * Unwrap API response that returns an array
 */
function unwrapArrayResponse<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
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
      return unwrapArrayResponse(data);
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to search students
 */
export const useStudentsSearch = (params?: StudentQuery, options?: { enabled?: boolean }) => {
  const hasSearchQuery = !!(params?.q || params?.fullName || params?.studentId);
  const enabled = options?.enabled !== undefined ? options.enabled && hasSearchQuery : hasSearchQuery;

  return useQuery({
    queryKey: queryKeys.students.search(params),
    queryFn: async () => {
      // Backend GET /students/search only accepts `q` — map fullName/studentId to it
      const q = params?.q || params?.fullName || params?.studentId;
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/search`, {
        params: { ...params, q },
      });
      // response interceptor may have already extracted data.data → data
      // Raw: { success, data: { data: [...], total } }
      // After interceptor: { data: [...], total }
      // We handle both:
      if (Array.isArray(data)) return data as any[];
      if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) return data.data as any[];
        if (data.data && typeof data.data === 'object' && Array.isArray(data.data.data)) return data.data.data as any[];
      }
      return [];
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch student by ID
 */
export const useStudent = (studentId: string) => {
  return useQuery<StudentData>({
    queryKey: queryKeys.students.detail(studentId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/profile/${studentId}`);
      return unwrapResponse<StudentData>(data);
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
      return unwrapResponse(data);
    },
    onSuccess: (_, variables) => {
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
      return unwrapResponse(data);
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
 * Hook to search students with POST params (classroomId + search filters)
 */
export const useStudentsWithParams = (
  params: { classroomId: string | null; search: { fullName: string; studentId: string } },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: queryKeys.students.searchWithParams(params),
    queryFn: async () => {
      const { data } = await httpClient.post(`${authConfig.studentEndpoint}/search-with-params`, {
        classroomId: params.classroomId,
        search: params.search,
      });
      return unwrapArrayResponse(data);
    },
    enabled: options?.enabled ?? !!params.classroomId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
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
      return unwrapResponse(data);
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};