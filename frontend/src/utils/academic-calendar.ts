import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import type {
  AcademicCalendarSettings,
  AcademicTerm,
  CalendarEvent,
  CalendarEventCategory,
} from '@/types/apps/academic-calendar';

export const VOCATIONAL_DIPLOMA_WEEKS = 15;
export const VOCATIONAL_CERTIFICATE_WEEKS = 18;

export const CALENDAR_EVENT_CATEGORIES: Record<CalendarEventCategory, { label: string; color: string }> = {
  holiday: { label: 'วันหยุด', color: '#f04452' },
  activity: { label: 'กิจกรรม', color: '#16a7ed' },
  exam: { label: 'สอบ', color: '#f5a400' },
  meeting: { label: 'ประชุม', color: '#7764cf' },
};

export interface AcademicWeek {
  number: number;
  start: Date;
  end: Date;
  includesDiploma: boolean;
}

/** สร้างค่าเริ่มต้นที่ยังไม่ระบุวันเปิดเทอมสำหรับปีการศึกษาใหม่ */
export const createEmptyCalendarSettings = (academicYear: number): AcademicCalendarSettings => ({
  academicYear,
  selectedTerm: 1,
  term1Start: '',
  term2Start: '',
  term1Name: `ภาคเรียนที่ 1/${academicYear}`,
  term2Name: `ภาคเรียนที่ 2/${academicYear}`,
  startWeekOnMonday: true,
});

/** ตรวจสอบวันที่รูปแบบ YYYY-MM-DD โดยไม่เปลี่ยนวันตาม timezone */
export const isValidCalendarDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false;
  const date = parseISO(value);
  return isValid(date) && format(date, 'yyyy-MM-dd') === value;
};

/** คืนวันเปิดภาคเรียนที่เลือก */
export const getTermStart = (settings: AcademicCalendarSettings, term: AcademicTerm = settings.selectedTerm): Date =>
  parseISO(term === 1 ? settings.term1Start : settings.term2Start);

/** คำนวณช่วงเรียนรายสัปดาห์ตามตัวเลือกวันเริ่มสัปดาห์ */
export const getAcademicWeeks = (settings: AcademicCalendarSettings): AcademicWeek[] => {
  const start = getTermStart(settings);
  if (!isValid(start)) return [];
  const anchor = settings.startWeekOnMonday ? startOfWeek(start, { weekStartsOn: 1 }) : start;

  return Array.from({ length: VOCATIONAL_CERTIFICATE_WEEKS }, (_, index) => {
    const weekStart = addDays(anchor, index * 7);
    return {
      number: index + 1,
      start: index === 0 ? start : weekStart,
      end: addDays(weekStart, 6),
      includesDiploma: index < VOCATIONAL_DIPLOMA_WEEKS,
    };
  });
};

/** คืนหมายเลขสัปดาห์ที่เรียน หรือ null เมื่ออยู่นอกภาคเรียน */
export const getAcademicWeekNumber = (settings: AcademicCalendarSettings, date: Date): number | null => {
  const weeks = getAcademicWeeks(settings);
  const day = startOfDay(date);
  if (!weeks.length || day < weeks[0].start || day > weeks[weeks.length - 1].end) return null;
  const anchor = settings.startWeekOnMonday
    ? startOfWeek(weeks[0].start, { weekStartsOn: 1 })
    : weeks[0].start;
  return Math.floor(differenceInCalendarDays(day, anchor) / 7) + 1;
};

/** คำนวณความคืบหน้าระหว่างวันเปิดภาคเรียนและวันสุดท้ายของ ปวช. */
export const getAcademicProgress = (settings: AcademicCalendarSettings, date: Date): number => {
  const weeks = getAcademicWeeks(settings);
  if (!weeks.length) return 0;
  const elapsed = differenceInCalendarDays(startOfDay(date), weeks[0].start) + 1;
  const total = differenceInCalendarDays(weeks[weeks.length - 1].end, weeks[0].start) + 1;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

/** สร้างช่องปฏิทินหกแถว เริ่มด้วยวันอาทิตย์ */
export const getCalendarDays = (month: Date): Date[] => {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  return Array.from({ length: 42 }, (_, index) => addDays(first, index));
};

/** ตรวจว่ากิจกรรมครอบคลุมวันที่ที่ระบุหรือไม่ */
export const eventOccursOnDate = (event: CalendarEvent, date: Date): boolean => {
  const dateKey = format(date, 'yyyy-MM-dd');
  return event.startDate <= dateKey && event.endDate >= dateKey;
};
