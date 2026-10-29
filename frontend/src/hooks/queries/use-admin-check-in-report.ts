import { useQuery } from '@tanstack/react-query';
import { clamp, format, isValid, startOfDay } from 'date-fns';
import { useState } from 'react';

import httpClient from '@/@core/utils/http';
import { authConfig } from '@/configs/auth';
import { queryKeys } from '@/libs/react-query/queryKeys';
import { getTermStart } from '@/utils/academic-calendar';
import { getAdminCheckInAcademicWeeks, getAdminCheckInReportRange } from '@/utils/admin-check-in-report';

import type { UseQueryResult } from '@tanstack/react-query';
import type { AcademicCalendarSettings, AcademicTerm } from '@/types/apps/academic-calendar';
import type { ReportCheckIn } from '@/types/apps/reportCheckIn';
import type { AcademicWeek } from '@/utils/academic-calendar';
import type { AdminCheckInReportPeriod, AdminCheckInReportRange } from '@/utils/admin-check-in-report';

import { useAcademicCalendarSettings } from './useAcademicCalendar';

interface ReportNavigation {
  settingsKey: string;
  term: AcademicTerm;
  date: Date | null;
}

interface AdminCheckInReportResult {
  settingsQuery: UseQueryResult<AcademicCalendarSettings | null, Error>;
  reportQuery: UseQueryResult<ReportCheckIn, Error>;
  settings: AcademicCalendarSettings | null;
  selectedTerm: AcademicTerm;
  selectedDate: Date | null;
  weeks: AcademicWeek[];
  range: AdminCheckInReportRange | null;
  handleSelectedTerm: (term: AcademicTerm) => void;
  handleSelectedDate: (date: Date | null) => void;
}

/** เชื่อม Academic Calendar กับรายงาน Admin โดยระบุ activityType สำหรับรายงานกิจกรรม */
export const useAdminCheckInReport = (
  period: AdminCheckInReportPeriod,
  activityType?: string,
): AdminCheckInReportResult => {
  const settingsQuery: UseQueryResult<AcademicCalendarSettings | null, Error> = useAcademicCalendarSettings();
  const settings: AcademicCalendarSettings | null = settingsQuery.data ?? null;
  const [navigation, setNavigation] = useState<ReportNavigation | null>(null);
  const settingsKey: string = settings
    ? `${settings.academicYear}:${settings.selectedTerm}:${settings.term1Start}:${settings.term2Start}:${settings.startWeekOnMonday}`
    : '';
  const currentNavigation: ReportNavigation | null = navigation?.settingsKey === settingsKey ? navigation : null;
  const selectedTerm: AcademicTerm = currentNavigation?.term ?? settings?.selectedTerm ?? 1;
  const weeks: AcademicWeek[] = settings ? getAdminCheckInAcademicWeeks({ ...settings, selectedTerm }) : [];
  const requestedDate: Date | null = currentNavigation ? currentNavigation.date : new Date();
  const selectedDate: Date | null =
    requestedDate && weeks.length
      ? clamp(startOfDay(requestedDate), { start: weeks[0].start, end: weeks[weeks.length - 1].end })
      : null;
  const range: AdminCheckInReportRange | null = getAdminCheckInReportRange(period, selectedDate, weeks);
  const startDate: string = range ? format(range.start, 'yyyy-MM-dd') : '';
  const endDate: string = range ? format(range.end, 'yyyy-MM-dd') : '';
  const endpoint: string | undefined = activityType
    ? authConfig.activityCheckInEndpoint
    : authConfig.reportCheckInEndpoint;
  const reportQuery: UseQueryResult<ReportCheckIn, Error> = useQuery({
    queryKey: activityType
      ? queryKeys.activityCheckIn.adminReport({ startDate, endDate, activityType })
      : queryKeys.checkIn.adminReport({ startDate, endDate }),
    queryFn: async ({ signal }): Promise<ReportCheckIn> => {
      const { data } = await httpClient.get<ReportCheckIn>(
        `${endpoint}/start-date/${startDate}/end-date/${endDate}/admin-daily-report`,
        { signal, ...(activityType ? { params: { activityType } } : {}) },
      );
      return data;
    },
    enabled: Boolean(range) && !settingsQuery.isError,
  });
  const handleSelectedTerm = (term: AcademicTerm): void => {
    if (!settings) return;
    setNavigation({ settingsKey, term, date: getTermStart(settings, term) });
  };
  const handleSelectedDate = (date: Date | null): void => {
    if (date && !isValid(date)) return;
    setNavigation({ settingsKey, term: selectedTerm, date });
  };
  return {
    settingsQuery,
    reportQuery,
    settings,
    selectedTerm,
    selectedDate,
    weeks,
    range,
    handleSelectedTerm,
    handleSelectedDate,
  };
};
