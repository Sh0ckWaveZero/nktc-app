import { useQuery } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

/**
 * Hook to fetch all departments
 */
export const useDepartments = () => {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: async () => {
      const { data } = await httpClient.get(`${process.env.NEXT_PUBLIC_API_URL}/departments`);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - departments rarely change
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
};

/**
 * Hook to fetch all programs
 */
export const usePrograms = () => {
  return useQuery({
    queryKey: queryKeys.programs.all,
    queryFn: async () => {
      const { data } = await httpClient.get(`${process.env.NEXT_PUBLIC_API_URL}/programs`);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - programs rarely change
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
};
