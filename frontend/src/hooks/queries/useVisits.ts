import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface VisitQuery {
  classroomId?: string;
  academicYear?: string;
  visitNo?: string;
  studentId?: string;
  skip?: number;
  take?: number;
  [key: string]: any;
}

/**
 * Hook to fetch visits list
 */
export const useVisits = (params?: VisitQuery) => {
  return useQuery({
    queryKey: queryKeys.visits.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.visitEndpoint}/get-visit/all`, {
        params,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to search visits
 */
export const useVisitSearch = (params?: VisitQuery) => {
  return useQuery({
    queryKey: queryKeys.visits.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.visitEndpoint}/get-visit/all`, {
        params,
      });
      return data;
    },
    enabled: !!(params?.classroomId || params?.studentId || params?.academicYear),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch visit by ID
 */
export const useVisit = (visitId: string) => {
  return useQuery({
    queryKey: queryKeys.visits.detail(visitId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.visitEndpoint}/${visitId}`);
      return data;
    },
    enabled: !!visitId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch visits for a specific student
 */
export const useStudentVisits = (studentId: string, skip: number = 0, take: number = 10) => {
  return useQuery({
    queryKey: queryKeys.visits.student(studentId),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.visitEndpoint}/${studentId}?skip=${skip}&take=${take}`
      );
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create visit record
 */
export const useCreateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await httpClient.post(authConfig.visitEndpoint!, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
  });
};

/**
 * Hook to update visit record
 */
export const useUpdateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, params }: { visitId: string; params: any }) => {
      const { data } = await httpClient.put(`${authConfig.visitEndpoint}/${visitId}`, params);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.detail(variables.visitId) });
    },
  });
};

/**
 * Hook to delete visit record
 */
export const useDeleteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitId: string) => {
      return await httpClient.delete(`${authConfig.visitEndpoint}/${visitId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
  });
};
