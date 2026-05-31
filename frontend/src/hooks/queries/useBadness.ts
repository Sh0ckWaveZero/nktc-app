import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

const BADNESS_INDIVIDUAL_ENDPOINT = authConfig.badnessIndividualEndpoint as string;

interface BadnessQuery {
  fullName?: string;
  classroomId?: string;
  badDate?: Date | null;
  studentId?: string;
  skip?: number;
  take?: number;
  [key: string]: any;
}

/**
 * Hook to fetch badness records list
 */
export const useBadnessRecords = (params?: BadnessQuery) => {
  return useQuery({
    queryKey: queryKeys.badness.list(params),
    queryFn: async () => {
      const { data } = await httpClient.post(`${BADNESS_INDIVIDUAL_ENDPOINT}/search`, params || {});
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to search badness records
 */
export const useBadnessSearch = (params?: BadnessQuery) => {
  return useQuery({
    queryKey: queryKeys.badness.list(params),
    queryFn: async () => {
      const { data } = await httpClient.post(`${BADNESS_INDIVIDUAL_ENDPOINT}/search`, params || {});
      return data;
    },
    enabled: !!(params?.fullName || params?.classroomId || params?.studentId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch badness records for a specific student
 */
export const useStudentBadnessRecords = (studentId: string, skip: number = 0, take: number = 10) => {
  return useQuery({
    queryKey: queryKeys.badness.student(studentId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${BADNESS_INDIVIDUAL_ENDPOINT}/${studentId}?skip=${skip}&take=${take}`);
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get badness summary
 */
export const useBadnessSummary = (params?: any) => {
  return useQuery({
    queryKey: [...queryKeys.badness.all, 'summary', params],
    queryFn: async () => {
      const { data } = await httpClient.post(`${BADNESS_INDIVIDUAL_ENDPOINT}/summary`, params || {});
      return data;
    },
    enabled: !!params,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create individual badness record
 */
export const useCreateBadnessRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await httpClient.post(BADNESS_INDIVIDUAL_ENDPOINT, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.badness.all });
    },
  });
};

/**
 * Hook to create batch badness records
 */
export const useCreateBadnessGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await httpClient.post(`${BADNESS_INDIVIDUAL_ENDPOINT}/group`, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.badness.all });
    },
  });
};

/**
 * Hook to delete badness record
 */
export const useDeleteBadnessRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await httpClient.delete(`${BADNESS_INDIVIDUAL_ENDPOINT}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.badness.all });
    },
  });
};
