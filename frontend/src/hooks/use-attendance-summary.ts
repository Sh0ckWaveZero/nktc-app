import { useState } from 'react';

import { useAttendanceSummaryOptions } from '@/hooks/queries/use-attendance-summary-options';
import { useAttendanceTermSummary } from '@/hooks/queries/use-attendance-term-summary';

import type { AcademicTerm } from '@/types/apps/academic-calendar';
import type { AttendanceSummaryOptions } from '@/types/apps/attendance-summary-options';

interface Selection {
  academicYear: number;
  term: AcademicTerm;
}

/** จัดการตัวกรองปีและภาคเรียน โดยไม่แก้ Calendar ส่วนกลาง */
export const useAttendanceSummary = () => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const optionsQuery: ReturnType<typeof useAttendanceSummaryOptions> = useAttendanceSummaryOptions();
  const years: AttendanceSummaryOptions['years'] = optionsQuery.data?.years ?? [];
  const defaultYear: number | null = optionsQuery.data?.currentAcademicYear ?? years[0]?.academicYear ?? null;
  const selectedYear: AttendanceSummaryOptions['years'][number] | undefined =
    years.find((year): boolean => year.academicYear === selection?.academicYear) ??
    years.find((year): boolean => year.academicYear === defaultYear) ??
    years[0];
  const academicYear: number | null = selectedYear?.academicYear ?? null;
  const selectedTerm: AcademicTerm =
    selection?.academicYear === academicYear ? selection.term : (optionsQuery.data?.currentTerm ?? 1);
  const selectedPeriod = selectedYear?.terms.find((term): boolean => term.term === selectedTerm);
  const summaryQuery: ReturnType<typeof useAttendanceTermSummary> = useAttendanceTermSummary(
    academicYear,
    selectedTerm,
  );
  const handleYearChange = (year: number): void => setSelection({ academicYear: year, term: 1 });
  const handleTermChange = (term: AcademicTerm): void => {
    if (academicYear === null) return;
    setSelection({ academicYear, term });
  };
  return {
    optionsQuery,
    summaryQuery,
    years,
    academicYear,
    selectedYear,
    selectedTerm,
    selectedPeriod,
    handleYearChange,
    handleTermChange,
  };
};
