import { useQuery } from '@tanstack/react-query';

import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

import type { UseQueryResult } from '@tanstack/react-query';
import type { AttendanceSummaryOptions } from '@/types/apps/attendance-summary-options';

/** ดึงปีการศึกษาและภาคเรียนที่มี Calendar จริงสำหรับ Dashboard */
export const useAttendanceSummaryOptions = (): UseQueryResult<AttendanceSummaryOptions, Error> =>
  useQuery({
    queryKey: queryKeys.checkIn.summaryOptions(),
    queryFn: async ({ signal }): Promise<AttendanceSummaryOptions> => {
      const { data } = await httpClient.get<AttendanceSummaryOptions>('/attendance-summary/options', { signal });
      return data;
    },
  });
