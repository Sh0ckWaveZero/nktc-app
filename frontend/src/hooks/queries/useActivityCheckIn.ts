import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';
import { toApiDate } from '@/utils/datetime';

interface ActivityCheckInParams {
  teacher: string;
  classroom: string;
  date?: string; // YYYY-MM-DD — กรองเฉพาะวันนั้น
  activityType?: string; // ประเภทกิจกรรม CLUB, AST, SCOUT
}

interface AddActivityCheckInData {
  teacherId: string;
  classroomId: string;
  present: string[];
  absent: string[];
  checkInDate: Date | string;
  status: string;
  activityType: string;
  note?: string;
}

/**
 * Hook to fetch activity check-in report
 * Get check-in data for a specific teacher and classroom
 */
export const useActivityCheckIn = (params: ActivityCheckInParams) => {
  return useQuery({
    queryKey: queryKeys.activityCheckIn.report(params),
    queryFn: async () => {
      // แนบ date และ activityType เพื่อกรองข้อมูล
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.activityType) queryParams.append('activityType', params.activityType);
      const paramStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${params.teacher}/classroom/${params.classroom}${paramStr}`,
      );
      return data;
    },
    enabled: !!params.teacher && !!params.classroom,
    staleTime: 30 * 1000, // 30 seconds - short cache for real-time data
    placeholderData: keepPreviousData,
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
      const response = await httpClient.post(authConfig.activityCheckInEndpoint as string, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      const paramKey = {
        teacher: variables.teacherId,
        classroom: variables.classroomId,
        date: toApiDate(variables.checkInDate),
        activityType: variables.activityType,
      };

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.activityCheckIn.report(paramKey),
      });

      // Optionally update cache directly
      queryClient.setQueryData(queryKeys.activityCheckIn.report(paramKey), data);
    },
  });
};
