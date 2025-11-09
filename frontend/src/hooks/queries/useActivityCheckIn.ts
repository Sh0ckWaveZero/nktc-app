import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface ActivityCheckInParams {
  teacher: string;
  classroom: string;
}

interface AddActivityCheckInData {
  teacherId: string;
  classroomId: string;
  present: string[];
  absent: string[];
  checkInDate: Date;
  status: string;
}

/**
 * Hook to fetch activity check-in report
 * Get check-in data for a specific teacher and classroom
 */
export const useActivityCheckIn = (params: ActivityCheckInParams) => {
  return useQuery({
    queryKey: queryKeys.activityCheckIn.report(params),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${params.teacher}/classroom/${params.classroom}`
      );
      return data;
    },
    enabled: !!params.teacher && !!params.classroom,
    staleTime: 30 * 1000, // 30 seconds - short cache for real-time data
    retry: 2,
  });
};

/**
 * Hook to add/create activity check-in
 * Mutation hook for creating new check-in record
 */
export const useAddActivityCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddActivityCheckInData) => {
      const response = await httpClient.post(
        authConfig.activityCheckInEndpoint as string,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.activityCheckIn.report({
          teacher: variables.teacherId,
          classroom: variables.classroomId,
        }),
      });

      // Optionally update cache directly
      queryClient.setQueryData(
        queryKeys.activityCheckIn.report({
          teacher: variables.teacherId,
          classroom: variables.classroomId,
        }),
        data
      );
    },
  });
};
