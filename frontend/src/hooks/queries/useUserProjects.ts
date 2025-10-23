import { useQuery } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

/**
 * Hook to fetch user projects list
 * Used in UsersProjectListTable component
 */
export const useUserProjects = (query?: string) => {
  return useQuery({
    queryKey: queryKeys.userProjects.list(query),
    queryFn: async () => {
      const { data } = await httpClient.get('/apps/users/project-list', {
        params: { q: query },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, even with empty query
  });
};
