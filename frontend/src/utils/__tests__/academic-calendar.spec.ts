import { format, parseISO } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { AcademicCalendarSettings, CalendarEvent } from '@/types/apps/academic-calendar';
import {
  eventOccursOnDate,
  getAcademicProgress,
  getAcademicWeekNumber,
  getAcademicWeeks,
  getCalendarDays,
  getTermStart,
  isValidCalendarDate,
} from '../academic-calendar';

const settings: AcademicCalendarSettings = {
  academicYear: 2569,
  selectedTerm: 1,
  term1Start: '2026-05-11',
  term2Start: '2026-10-26',
  term1Name: 'ภาคเรียนที่ 1/2569',
  term2Name: 'ภาคเรียนที่ 2/2569',
  startWeekOnMonday: true,
};

const dateKey = (date: Date) => format(date, 'yyyy-MM-dd');

describe('academic calendar calculations', () => {
  it('calculates the 15- and 18-week end dates shown in the reference', () => {
    const weeks = getAcademicWeeks(settings);
    expect(weeks).toHaveLength(18);
    expect(dateKey(weeks[0].start)).toBe('2026-05-11');
    expect(dateKey(weeks[0].end)).toBe('2026-05-17');
    expect(dateKey(weeks[14].end)).toBe('2026-08-23');
    expect(dateKey(weeks[17].end)).toBe('2026-09-13');
    expect(weeks[14].includesDiploma).toBe(true);
    expect(weeks[15].includesDiploma).toBe(false);
  });

  it('uses partial first weeks when aligned to Monday and full weeks otherwise', () => {
    const midweek = { ...settings, term1Start: '2026-05-13' };
    const aligned = getAcademicWeeks(midweek);
    const unaligned = getAcademicWeeks({ ...midweek, startWeekOnMonday: false });
    expect(dateKey(aligned[0].start)).toBe('2026-05-13');
    expect(dateKey(aligned[0].end)).toBe('2026-05-17');
    expect(dateKey(aligned[14].end)).toBe('2026-08-23');
    expect(dateKey(unaligned[0].end)).toBe('2026-05-19');
    expect(dateKey(unaligned[14].end)).toBe('2026-08-25');
    expect(getAcademicWeekNumber(midweek, parseISO('2026-05-12'))).toBeNull();
    expect(getAcademicWeekNumber(midweek, parseISO('2026-05-18'))).toBe(2);
    expect(getAcademicWeekNumber({ ...midweek, startWeekOnMonday: false }, parseISO('2026-05-18'))).toBe(1);
  });

  it('marks term boundaries, reports progress, and switches to term 2', () => {
    expect(getAcademicWeekNumber(settings, parseISO('2026-05-10'))).toBeNull();
    expect(getAcademicWeekNumber(settings, parseISO('2026-08-23'))).toBe(15);
    expect(getAcademicWeekNumber(settings, parseISO('2026-08-24'))).toBe(16);
    expect(getAcademicWeekNumber(settings, parseISO('2026-09-13'))).toBe(18);
    expect(getAcademicWeekNumber(settings, parseISO('2026-09-14'))).toBeNull();
    expect(getAcademicProgress(settings, parseISO('2026-05-10'))).toBe(0);
    expect(getAcademicProgress(settings, parseISO('2026-09-13'))).toBe(100);
    expect(getAcademicProgress(settings, parseISO('2026-10-01'))).toBe(100);

    const secondTerm: AcademicCalendarSettings = { ...settings, selectedTerm: 2 };
    expect(dateKey(getTermStart(secondTerm))).toBe('2026-10-26');
    expect(dateKey(getAcademicWeeks(secondTerm)[14].end)).toBe('2027-02-07');
    expect(dateKey(getAcademicWeeks(secondTerm)[17].end)).toBe('2027-02-28');
  });

  it('rejects invalid date strings and includes overlapping multi-day events', () => {
    expect(isValidCalendarDate('2026-02-31')).toBe(false);
    expect(isValidCalendarDate('0000-01-01')).toBe(false);
    expect(isValidCalendarDate('2028-02-29')).toBe(true);
    const event: CalendarEvent = {
      id: 'event-1',
      title: 'กิจกรรม',
      category: 'activity',
      startDate: '2026-05-30',
      endDate: '2026-06-02',
      description: null,
    };
    expect(eventOccursOnDate(event, parseISO('2026-06-01'))).toBe(true);
    expect(eventOccursOnDate(event, parseISO('2026-06-03'))).toBe(false);
    const days = getCalendarDays(parseISO('2026-06-01'));
    expect(days).toHaveLength(42);
    expect(dateKey(days[0])).toBe('2026-05-31');
  });
});
