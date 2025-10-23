import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

