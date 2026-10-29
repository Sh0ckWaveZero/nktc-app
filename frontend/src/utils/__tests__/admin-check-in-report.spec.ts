import { format, parseISO } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { AcademicCalendarSettings } from '@/types/apps/academic-calendar';

import { getAdminCheckInAcademicWeeks, getAdminCheckInReportRange } from '../admin-check-in-report';
import type { AdminCheckInReportRange } from '../admin-check-in-report';

const settings: AcademicCalendarSettings = {
  academicYear: 2569,
  selectedTerm: 1,
  term1Start: '2026-05-13',
  term2Start: '2026-10-28',
  term1Name: 'ภาคเรียนที่ 1/2569',
  term2Name: 'ภาคเรียนที่ 2/2569',
  startWeekOnMonday: true,
};

const rangeDates = (range: AdminCheckInReportRange | null): string[] | null =>
  range ? [format(range.start, 'yyyy-MM-dd'), format(range.end, 'yyyy-MM-dd')] : null;

describe('admin check-in academic report periods', () => {
  it('excludes days before opening and after the calendar term ends', () => {
    const weeks = getAdminCheckInAcademicWeeks(settings);
    expect(getAdminCheckInReportRange('daily', parseISO('2026-05-12'), weeks)).toBeNull();
    expect(getAdminCheckInReportRange('daily', parseISO('2026-09-14'), weeks)).toBeNull();
    expect(rangeDates(getAdminCheckInReportRange('daily', parseISO('2026-05-13'), weeks))).toEqual([
      '2026-05-13',
      '2026-05-13',
    ]);
    expect(rangeDates(getAdminCheckInReportRange('daily', parseISO('2026-09-13'), weeks))).toEqual([
      '2026-09-13',
      '2026-09-13',
    ]);
  });

  it('uses the partial first week and subsequent Monday-to-Sunday calendar weeks', () => {
    const weeks = getAdminCheckInAcademicWeeks(settings);
    const firstWeek = getAdminCheckInReportRange('weekly', parseISO('2026-05-14'), weeks);
    const secondWeek = getAdminCheckInReportRange('weekly', parseISO('2026-05-18'), weeks);
    expect(rangeDates(firstWeek)).toEqual(['2026-05-13', '2026-05-17']);
    expect(firstWeek?.weekNumber).toBe(1);
    expect(rangeDates(secondWeek)).toEqual(['2026-05-18', '2026-05-24']);
    expect(secondWeek?.weekNumber).toBe(2);
  });

  it('follows the calendar when weeks start on opening day instead of Monday', () => {
    const weeks = getAdminCheckInAcademicWeeks({ ...settings, startWeekOnMonday: false });
    expect(rangeDates(getAdminCheckInReportRange('weekly', parseISO('2026-05-18'), weeks))).toEqual([
      '2026-05-13',
      '2026-05-19',
    ]);
    expect(rangeDates(getAdminCheckInReportRange('weekly', parseISO('2026-05-20'), weeks))).toEqual([
      '2026-05-20',
      '2026-05-26',
    ]);
  });

  it('clips the first and last monthly reports to the academic term', () => {
    const weeks = getAdminCheckInAcademicWeeks(settings);
    expect(rangeDates(getAdminCheckInReportRange('monthly', parseISO('2026-05-14'), weeks))).toEqual([
      '2026-05-13',
      '2026-05-31',
    ]);
    expect(rangeDates(getAdminCheckInReportRange('monthly', parseISO('2026-06-14'), weeks))).toEqual([
      '2026-06-01',
      '2026-06-30',
    ]);
    expect(rangeDates(getAdminCheckInReportRange('monthly', parseISO('2026-09-10'), weeks))).toEqual([
      '2026-09-01',
      '2026-09-13',
    ]);
  });

  it('does not include the next term when its opening date overlaps the 18-week schedule', () => {
    const weeks = getAdminCheckInAcademicWeeks({ ...settings, term2Start: '2026-06-10' });
    expect(format(weeks[weeks.length - 1].end, 'yyyy-MM-dd')).toBe('2026-06-09');
    expect(rangeDates(getAdminCheckInReportRange('weekly', parseISO('2026-06-09'), weeks))).toEqual([
      '2026-06-08',
      '2026-06-09',
    ]);
    expect(rangeDates(getAdminCheckInReportRange('monthly', parseISO('2026-06-09'), weeks))).toEqual([
      '2026-06-01',
      '2026-06-09',
    ]);
    expect(getAdminCheckInReportRange('daily', parseISO('2026-06-10'), weeks)).toBeNull();
  });

  it('keeps term 2 within the same academic year while its dates cross into the next calendar year', () => {
    const weeks = getAdminCheckInAcademicWeeks({ ...settings, selectedTerm: 2 });
    expect(rangeDates(getAdminCheckInReportRange('weekly', parseISO('2026-10-29'), weeks))).toEqual([
      '2026-10-28',
      '2026-11-01',
    ]);
    expect(rangeDates(getAdminCheckInReportRange('monthly', parseISO('2027-01-14'), weeks))).toEqual([
      '2027-01-01',
      '2027-01-31',
    ]);
    expect(format(weeks[weeks.length - 1].end, 'yyyy-MM-dd')).toBe('2027-02-28');
  });

  it('does not create a report range without a valid date and opening day', () => {
    expect(getAdminCheckInAcademicWeeks({ ...settings, term1Start: '' })).toEqual([]);
    expect(getAdminCheckInReportRange('weekly', parseISO('2026-05-14'), [])).toBeNull();
    expect(getAdminCheckInReportRange('monthly', null, getAdminCheckInAcademicWeeks(settings))).toBeNull();
    expect(getAdminCheckInReportRange('daily', new Date('invalid'), getAdminCheckInAcademicWeeks(settings))).toBeNull();
  });
});
