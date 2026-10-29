import { endOfMonth, isValid, max, min, startOfDay, startOfMonth, subDays } from 'date-fns';

import type { AcademicCalendarSettings } from '@/types/apps/academic-calendar';

import { getAcademicWeeks, getTermStart, isValidCalendarDate } from './academic-calendar';
import type { AcademicWeek } from './academic-calendar';
import { formatFullDateThai, formatLongDateThai, getBuddhistYear, getThaiMonthName } from './datetime';

export type AdminCheckInReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface AdminCheckInReportRange {
  start: Date;
  end: Date;
  weekNumber: number | null;
}

/** คืนรอบ AcademicWeek จากปฏิทิน โดยไม่รวมวันที่ของภาคเรียนถัดไป */
export const getAdminCheckInAcademicWeeks = (settings: AcademicCalendarSettings): AcademicWeek[] => {
  const weeks: AcademicWeek[] = getAcademicWeeks(settings);
  if (settings.selectedTerm === 2 || !isValidCalendarDate(settings.term2Start)) return weeks;
  const termEnd: Date = subDays(getTermStart(settings, 2), 1);
  return weeks
    .filter((week: AcademicWeek): boolean => week.start <= termEnd)
    .map((week: AcademicWeek): AcademicWeek => ({ ...week, end: min([week.end, termEnd]) }));
};

/** คำนวณ DateRange รายวัน รายสัปดาห์ หรือรายเดือนภายในภาคเรียน */
export const getAdminCheckInReportRange = (
  period: AdminCheckInReportPeriod,
  date: Date | null,
  weeks: readonly AcademicWeek[],
): AdminCheckInReportRange | null => {
  if (!date || !isValid(date) || !weeks.length) return null;
  const day: Date = startOfDay(date);
  const termStart: Date = weeks[0].start;
  const termEnd: Date = weeks[weeks.length - 1].end;
  if (day < termStart || day > termEnd) return null;
  if (period === 'daily') return { start: day, end: day, weekNumber: null };
  if (period === 'monthly') {
    return {
      start: max([startOfMonth(day), termStart]),
      end: min([endOfMonth(day), termEnd]),
      weekNumber: null,
    };
  }
  const week: AcademicWeek | undefined = weeks.find(
    (entry: AcademicWeek): boolean => day >= entry.start && day <= entry.end,
  );
  return week ? { start: week.start, end: week.end, weekNumber: week.number } : null;
};

/** สร้างข้อความช่วงรายงานจาก DateRange ที่ใช้ดึงข้อมูลจริง */
export const getAdminCheckInReportPeriodLabel = (
  period: AdminCheckInReportPeriod,
  range: AdminCheckInReportRange | null,
): string => {
  if (!range) return '';
  if (period === 'daily') return `ประจำ${formatFullDateThai(range.start)}`;
  const dates: string = `${formatLongDateThai(range.start)} - ${formatLongDateThai(range.end)}`;
  if (period === 'weekly') return `สัปดาห์ที่ ${range.weekNumber} (${dates})`;
  return `ประจำเดือน ${getThaiMonthName(range.start)} ${getBuddhistYear(range.start)} (${dates})`;
};
