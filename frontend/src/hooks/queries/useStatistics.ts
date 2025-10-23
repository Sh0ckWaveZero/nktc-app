import { useQuery } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface TermStatisticsParams {
  startDate: string;
  endDate: string;
  academicYear?: string;
  departmentId?: string;
  programId?: string;
}

/**
 * Hook to fetch term statistics with React Query
 * Auto-refetches when params change
 */
export const useTermStatistics = (params: TermStatisticsParams) => {
  return useQuery({
    queryKey: queryKeys.statistics.term(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
        ...(params.academicYear && { academicYear: params.academicYear }),
        ...(params.departmentId && params.departmentId !== 'all' && { departmentId: params.departmentId }),
        ...(params.programId && params.programId !== 'all' && { programId: params.programId }),
      });

      const { data } = await httpClient.get(
        `${process.env.NEXT_PUBLIC_API_URL}/statistics/term?${queryParams.toString()}`
      );

      return data;
    },
    enabled: !!(params.startDate && params.endDate), // Only fetch when dates are provided
    staleTime: 10 * 60 * 1000, // 10 minutes - statistics don't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
  });
};
