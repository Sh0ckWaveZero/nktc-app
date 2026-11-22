import { useMutation, useQueryClient } from '@tanstack/react-query';

import httpClient from '@/@core/utils/http';
import { authConfig } from '@/configs/auth';
import { queryKeys } from '@/libs/react-query/queryKeys';

import type { QueryClient, UseMutationResult } from '@tanstack/react-query';
import type { AcademicTerm } from '@/types/apps/academic-calendar';

interface ResetAttendanceTermInput {
  academicYear: number;
  term: AcademicTerm;
  activityType?: string;
}

/** รีเซ็ต Check-in ตามภาคเรียน แล้วโหลดรายงานและสถิติที่เกี่ยวข้องใหม่ */
export const useResetAttendanceTerm = (): UseMutationResult<{ deleted: number }, Error, ResetAttendanceTermInput> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ResetAttendanceTermInput): Promise<{ deleted: number }> => {
      const endpoint: string | undefined = input.activityType
        ? authConfig.activityCheckInEndpoint
        : authConfig.reportCheckInEndpoint;
      const { data } = await httpClient.delete<{ deleted: number }>(`${endpoint}/reset-term`, { data: input });
      return data;
    },
    onSuccess: async (_result, input): Promise<void> => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: input.activityType ? queryKeys.activityCheckIn.all : queryKeys.checkIn.all,
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all }),
      ]);
    },
  });
};
