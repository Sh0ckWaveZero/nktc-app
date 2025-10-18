import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { BUDDHIST_ERA_OFFSET } from '@/@core/utils/constants';

/**
 * Helper functions for Thai date formatting and manipulation
 */

/**
 * Format date to Thai date string with Buddhist Era (พ.ศ.)
 * @param date - Date to format
 * @returns Formatted Thai date string (e.g., "1 มกราคม 2567")
 */
export const formatThaiDate = (date: Date | null): string => {
  if (!date) return '';
  const thaiYear = date.getFullYear() + BUDDHIST_ERA_OFFSET;
  const day = format(date, 'd', { locale: th });
  const month = format(date, 'MMMM', { locale: th });
  return `${day} ${month} ${thaiYear}`;
};

/**
 * Format date for API submission (ISO format)
 * @param date - Date to format
 * @returns ISO formatted date string (e.g., "2024-01-01")
 */
export const formatDateForAPI = (date: Date | null): string => {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get the first day of current month
 * @returns Date object representing start of month
 */
export const getStartOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Get the last day of current month
 * @returns Date object representing end of month
 */
export const getEndOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};

/**
 * Get the first day of current year
 * @returns Date object representing start of year
 */
export const getStartOfYear = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
};

/**
 * Get the last day of current year
 * @returns Date object representing end of year
 */
export const getEndOfYear = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31);
};

/**
 * Get date one year ago from today
 * @returns Date object representing one year ago
 */
export const getOneYearAgo = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
};

/**
 * Parse Thai Buddhist year to Gregorian year
 * @param thaiYear - Buddhist Era year (e.g., 2567)
 * @returns Gregorian year (e.g., 2024)
 */
export const thaiYearToGregorian = (thaiYear: number): number => {
  return thaiYear - BUDDHIST_ERA_OFFSET;
};

/**
 * Parse Gregorian year to Thai Buddhist year
 * @param gregorianYear - Gregorian year (e.g., 2024)
 * @returns Buddhist Era year (e.g., 2567)
 */
export const gregorianYearToThai = (gregorianYear: number): number => {
  return gregorianYear + BUDDHIST_ERA_OFFSET;
};
