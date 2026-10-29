import type { AcademicCalendarSettings } from './academic-calendar';

export interface AcademicYear {
  academicYear: number;
  status: 'active' | 'draft' | 'archived';
  activatedAt: string | null;
  createdAt: string;
  calendar: AcademicCalendarSettings | null;
}

export interface AcademicYearContext {
  activeAcademicYear: number;
  version: number;
  years: AcademicYear[];
}

export interface AcademicYearCounts {
  attendance: number;
  activities: number;
  visits: number;
  goodness: number;
  badness: number;
  events: number;
}

export interface AcademicYearManagement extends Omit<AcademicYearContext, 'years'> {
  years: (AcademicYear & { counts: AcademicYearCounts })[];
}
