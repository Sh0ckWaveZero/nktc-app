export interface AttendanceSummaryOptions {
  currentAcademicYear: number | null;
  currentTerm: 1 | 2;
  years: {
    academicYear: number;
    terms: { term: 1 | 2; name: string; startDate: string; endDate: string }[];
  }[];
}
