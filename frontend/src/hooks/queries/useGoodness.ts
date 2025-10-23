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
export const useGoodnessSearch = (params?: GoodnessQuery) => {
  return useQuery({
    queryKey: queryKeys.goodness.list(params),
    queryFn: async () => {
      const { data } = await httpClient.post(
        `${authConfig.goodnessIndividualEndpoint}/search`,
        params || {}
      );
      return data;
    },
    enabled: !!(params?.fullName || params?.classroomId || params?.studentId),
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
