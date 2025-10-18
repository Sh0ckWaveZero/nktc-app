import { BUDDHIST_ERA_OFFSET } from './constants';
import { format, addDays } from 'date-fns';
import { th } from 'date-fns/locale';

/**
 * Thai calendar utility functions using date-fns
 * Provides standardized functions for Thai Buddhist Era calculations
 */

/**
 * Convert Gregorian year to Thai Buddhist year
 * @param gregorianYear - Gregorian year (e.g., 2024)
 * @returns Buddhist Era year (e.g., 2567)
 */
export const gregorianToThaiYear = (gregorianYear: number): number => {
  return gregorianYear + BUDDHIST_ERA_OFFSET;
};

/**
 * Convert Thai Buddhist year to Gregorian year
 * @param thaiYear - Buddhist Era year (e.g., 2567)
 * @returns Gregorian year (e.g., 2024)
 */
export const thaiToGregorianYear = (thaiYear: number): number => {
  return thaiYear - BUDDHIST_ERA_OFFSET;
};

/**
 * Get Thai year from a Date object
 * @param date - Date object
 * @returns Thai Buddhist year
 */
export const getThaiYear = (date: Date): number => {
  return date.getFullYear() + BUDDHIST_ERA_OFFSET;
};

/**
 * Format date to Thai date string with Buddhist Era year using date-fns
 * @param date - Date to format (Date object or string)
 * @param formatString - Format string (default: 'd MMMM yyyy')
 * @returns Formatted Thai date string (e.g., "1 มกราคม 2567")
 */
export const formatThaiDate = (date: Date | string | null, formatString: string = 'd MMMM yyyy'): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // ตรวจสอบว่า date ที่ parse ได้ถูกต้องหรือไม่
  if (isNaN(dateObj.getTime())) return '';

  const thaiYear = getThaiYear(dateObj);
  // แทนที่ปีใน format string ด้วยปีไทย
  const thaiFormatString = formatString.replace('yyyy', thaiYear.toString());

  return format(dateObj, thaiFormatString, { locale: th });
};

/**
 * Format date for Thai short format (day/month/year)
 * @param date - Date to format (Date object or string)
 * @returns Formatted Thai date string (e.g., "1/1/2567")
 */
export const formatThaiShortDate = (date: Date | string | null): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // ตรวจสอบว่า date ที่ parse ได้ถูกต้องหรือไม่
  if (isNaN(dateObj.getTime())) return '';

  const thaiYear = getThaiYear(dateObj);
  const day = format(dateObj, 'd', { locale: th });
  const month = format(dateObj, 'M', { locale: th });

  return `${day}/${month}/${thaiYear}`;
};

/**
 * Format date for Thai medium format (day month year)
 * @param date - Date to format
 * @returns Formatted Thai date string (e.g., "1 ม.ค. 2567")
 */
export const formatThaiMediumDate = (date: Date | null): string => {
  if (!date) return '';

  const thaiYear = getThaiYear(date);
  const day = format(date, 'd', { locale: th });
  const month = format(date, 'MMM', { locale: th });

  return `${day} ${month} ${thaiYear}`;
};

/**
 * Format date for Thai year-month format
 * @param date - Date to format
 * @returns Formatted Thai date string (e.g., "มกราคม 2567")
 */
export const formatThaiYearMonth = (date: Date | null): string => {
  if (!date) return '';

  const thaiYear = getThaiYear(date);
  return format(date, `MMMM ${thaiYear}`, { locale: th });
};

/**
 * Add days to date using date-fns
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with added days
 */
export const addDaysToDate = (date: Date, days: number): Date => {
  return addDays(date, days);
};

/**
 * Validate if a year is a valid Thai Buddhist year
 * @param year - Year to validate
 * @returns Boolean indicating if year is valid
 */
export const isValidThaiYear = (year: number): boolean => {
  return year >= 1 && year <= 9999; // Reasonable range for Buddhist Era
};

/**
 * Get current Thai year
 * @returns Current Thai Buddhist year
 */
export const getCurrentThaiYear = (): number => {
  return getThaiYear(new Date());
};
