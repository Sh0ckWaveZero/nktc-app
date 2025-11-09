import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface GoodnessQuery {
  fullName?: string;
  classroomId?: string;
  goodDate?: Date | null;
  studentId?: string;
  skip?: number;
  take?: number;
  [key: string]: any;
}

/**
 * Hook to fetch goodness records list
 */
export const useGoodnessRecords = (params?: GoodnessQuery) => {
  return useQuery({
    queryKey: queryKeys.goodness.list(params),
    queryFn: async () => {
      const { data } = await httpClient.post(
        `${authConfig.goodnessIndividualEndpoint}/search`,
        params || {}
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to search goodness records
 */
export const useGoodnessSearch = (params?: GoodnessQuery, options?: { enabled?: boolean }) => {
  const hasSearchQuery = !!(params?.fullName || params?.classroomId || params?.studentId || params?.goodDate);
  const enabled = options?.enabled !== undefined ? options.enabled && hasSearchQuery : hasSearchQuery;
  
  return useQuery({
    queryKey: queryKeys.goodness.list(params),
    queryFn: async () => {
      const { data } = await httpClient.post(
        `${authConfig.goodnessIndividualEndpoint}/search`,
        params || {}
      );
      
      // Handle different response formats:
      // 1. { success, statusCode, message, data: { data: [...], total }, meta }
      // 2. { data: [...], total }
      // 3. Array directly
      
      if (!data || typeof data !== 'object') {
        return { data: [], total: 0 };
      }
      
      // Check for nested structure: { success, data: { data: [...], total } }
      if ('success' in data && 'data' in data && data.data && typeof data.data === 'object') {
        // Check if data.data has nested data property
        if ('data' in data.data && Array.isArray(data.data.data)) {
          // Structure: { success, data: { data: [...], total } }
          return {
            data: data.data.data,
            total: data.data.total || data.data.data.length,
          };
        }
        // Check if data.data is already an array
        if (Array.isArray(data.data)) {
          // Structure: { success, data: [...] }
          return {
            data: data.data,
            total: data.data.length,
          };
        }
      }
      
      // Check for direct structure: { data: [...], total }
      if ('data' in data && Array.isArray(data.data)) {
        return {
          data: data.data,
          total: data.total || data.data.length,
        };
      }
      
      // Check if data is array directly
      if (Array.isArray(data)) {
        return {
          data,
          total: data.length,
        };
      }
      
      // Fallback
      return { data: [], total: 0 };
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch goodness records for a specific student
 */
export const useStudentGoodnessRecords = (studentId: string, skip: number = 0, take: number = 10) => {
  return useQuery({
    queryKey: queryKeys.goodness.student(studentId),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.goodnessIndividualEndpoint}/${studentId}?skip=${skip}&take=${take}`
      );
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get goodness summary
 */
export const useGoodnessSummary = (params?: any) => {
  return useQuery({
    queryKey: [...queryKeys.goodness.all, 'summary', params],
    queryFn: async () => {
      const { data } = await httpClient.post(
        `${authConfig.goodnessIndividualEndpoint}/summary`,
        params || {}
      );
      return data;
    },
    enabled: !!params,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create individual goodness record
 */
export const useCreateGoodnessRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await httpClient.post(authConfig.goodnessIndividualEndpoint!, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goodness.all });
    },
  });
};

/**
 * Hook to create batch goodness records
 */
export const useCreateGoodnessGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await httpClient.post(
        `${authConfig.goodnessIndividualEndpoint}/group`,
        params
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goodness.all });
    },
  });
};

/**
 * Hook to delete goodness record
 */
export const useDeleteGoodnessRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await httpClient.delete(`${authConfig.goodnessIndividualEndpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goodness.all });
    },
  });
};
