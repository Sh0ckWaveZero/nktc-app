import { useQuery } from '@tanstack/react-query';

import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

import type { UseQueryResult } from '@tanstack/react-query';
import type { AcademicTerm } from '@/types/apps/academic-calendar';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';

/** ดึงสถิติรายภาคเรียนที่ Backend จำกัดช่วงตามปฏิทินการศึกษา */
export const useAttendanceTermSummary = (
  academicYear: number | null,
  term: AcademicTerm,
): UseQueryResult<AttendanceSummary, Error> =>
  useQuery({
    queryKey: queryKeys.checkIn.termSummary({ academicYear, term }),
    queryFn: async ({ signal }): Promise<AttendanceSummary> => {
      const { data } = await httpClient.get<AttendanceSummary>('/attendance-summary/term', {
        params: { academicYear, term },
        signal,
      });
      return data;
    },
    enabled: academicYear !== null,
  });
