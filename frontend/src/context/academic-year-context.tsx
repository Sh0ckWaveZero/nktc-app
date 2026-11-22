'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo } from 'react';
import { Alert, Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

import Spinner from '@/@core/components/spinner';
import { useAcademicYearsContext } from '@/hooks/queries/use-academic-years';
import { useAcademicYearStore } from '@/store/academic-year';
import { useReportCheckInStore } from '@/store/apps/report-check-in';
import { useActivityCheckInStore } from '@/store/apps/activity-check-in';
import type { ReactElement, ReactNode } from 'react';
import type { AcademicYearContext } from '@/types/apps/academic-year';

interface AcademicYearScope extends AcademicYearContext {
  academicYear: number;
  isHistorical: boolean;
  selectYear: (academicYear: number | null) => void;
  refresh: () => Promise<void>;
}

const Context = createContext<AcademicYearScope | null>(null);

/** อ่านปีที่เลือกและคำสั่งสลับปี โดยคงข้อมูล Server ไว้ใน React Query */
export const useAcademicYear = (): AcademicYearScope => {
  const context = useContext(Context);
  if (!context) throw new Error('AcademicYearProvider is required');
  return context;
};

interface AcademicYearProviderProps {
  children: ReactNode;
}

/** ล้างข้อมูลปีเดิมก่อน Mount หน้าทำงานของปีใหม่ ป้องกัน Cache ปะปนกัน */
export const AcademicYearProvider = ({ children }: AcademicYearProviderProps): ReactElement => {
  const contextQuery = useAcademicYearsContext();
  const queryClient = useQueryClient();
  const scope = useAcademicYearStore();
  const data = contextQuery.data;
  const selectedYear = data?.years.some((year) => year.academicYear === scope.selectedAcademicYear)
    ? scope.selectedAcademicYear
    : null;
  const academicYear = selectedYear ?? data?.activeAcademicYear;
  const isReady = Boolean(data && academicYear === scope.academicYear && data.version === scope.version);
  const { refetch } = contextQuery;
  const refresh = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);
  const value = useMemo<AcademicYearScope | null>(
    () =>
      data && academicYear !== undefined
        ? {
            ...data,
            academicYear,
            isHistorical: academicYear !== data.activeAcademicYear,
            selectYear: scope.selectYear,
            refresh,
          }
        : null,
    [data, academicYear, scope.selectYear, refresh],
  );

  useEffect(() => {
    const handleYearChanged = (): void => {
      void refetch({ cancelRefetch: false });
    };
    window.addEventListener('academic-year-changed', handleYearChanged);
    return () => window.removeEventListener('academic-year-changed', handleYearChanged);
  }, [refetch]);

  useEffect(() => {
    if (!data || academicYear === undefined || isReady) return;
    let isCancelled = false;
    const changeScope = async (): Promise<void> => {
      const filter = {
        predicate: (query: { queryKey: readonly unknown[] }): boolean =>
          !(query.queryKey[0] === 'academic-years' && query.queryKey[1] === 'context'),
      };
      await queryClient.cancelQueries(filter);
      if (isCancelled) return;
      queryClient.removeQueries(filter);
      useReportCheckInStore.setState({
        reportCheckIn: null,
        reportCheckInLoading: false,
        hasReportCheckInErrors: false,
      });
      useActivityCheckInStore.setState({
        activityCheckIn: null,
        activityCheckInLoading: false,
        activityCheckInErrors: false,
      });
      useAcademicYearStore.getState().setScope(academicYear, data.activeAcademicYear, data.version);
    };
    void changeScope();
    return () => {
      isCancelled = true;
    };
  }, [academicYear, data, isReady, queryClient]);

  if (contextQuery.isError && !data)
    return (
      <Alert severity='error' action={<Button onClick={() => void contextQuery.refetch()}>ลองอีกครั้ง</Button>}>
        โหลดปีการศึกษาไม่สำเร็จ
      </Alert>
    );
  if (!data || academicYear === undefined || !isReady || !value) return <Spinner />;
  return (
    <Context.Provider value={value}>
      <Fragment key={`${academicYear}:${data.version}`}>{children}</Fragment>
    </Context.Provider>
  );
};
