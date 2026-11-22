export type AcademicTerm = 1 | 2;
export type CalendarEventCategory = 'holiday' | 'activity' | 'exam' | 'meeting';

export interface AcademicCalendarSettings {
  academicYear: number;
  selectedTerm: AcademicTerm;
  term1Start: string;
  term2Start: string;
  term1Name: string;
  term2Name: string;
  startWeekOnMonday: boolean;
}

export interface CalendarEventInput {
  title: string;
  category: CalendarEventCategory;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface CalendarEvent extends Omit<CalendarEventInput, 'description'> {
  id: string;
  description: string | null;
}

export interface CalendarEventFilters {
  from?: string;
  to?: string;
  startsFrom?: string;
  limit?: number;
}
