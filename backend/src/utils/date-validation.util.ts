import { BadRequestException } from '@nestjs/common';

/**
 * Validates if a date string can be parsed into a valid Date object
 * @param dateString - The date string to validate
 * @returns boolean - true if valid, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validates and parses a date string, throws BadRequestException if invalid
 * @param dateString - The date string to parse
 * @param fieldName - The field name for error message
 * @returns Date - Parsed date object
 * @throws BadRequestException if date is invalid
 */
export function validateAndParseDate(
  dateString: string,
  fieldName: string = 'วันที่',
): Date {
  if (!dateString || typeof dateString !== 'string') {
    throw new BadRequestException(`${fieldName}ไม่ถูกต้อง`);
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new BadRequestException(`รูปแบบ${fieldName}ไม่ถูกต้อง`);
  }

  return date;
}

/**
 * Validates a date range, ensuring start date is before end date
 * @param startDate - Start date
 * @param endDate - End date
 * @throws BadRequestException if range is invalid
 */
export function validateDateRange(startDate: Date, endDate: Date): void {
  if (startDate > endDate) {
    throw new BadRequestException(
      'วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด',
    );
  }
}

/**
 * Sets time to start of day (00:00:00.000)
 * @param date - Date to modify
 * @returns Date - Modified date object
 */
export function setStartOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Sets time to end of day (23:59:59.999)
 * @param date - Date to modify
 * @returns Date - Modified date object
 */
export function setEndOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/**
 * Validates and prepares date range for database queries
 * @param startDateString - Start date string
 * @param endDateString - End date string
 * @returns Object containing validated start and end dates
 * @throws BadRequestException if dates are invalid
 */
export function validateAndPrepareDateRange(
  startDateString: string,
  endDateString: string,
): { startDate: Date; endDate: Date } {
  const startDate = validateAndParseDate(startDateString, 'วันที่เริ่มต้น');
  const endDate = validateAndParseDate(endDateString, 'วันที่สิ้นสุด');

  validateDateRange(startDate, endDate);

  return {
    startDate: setStartOfDay(startDate),
    endDate: setEndOfDay(endDate),
  };
}

/**
 * Checks if a date is within a given range
 * @param date - Date to check
 * @param startDate - Start of range
 * @param endDate - End of range
 * @returns boolean - true if date is within range
 */
export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date,
): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Calculates the number of days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns number - Number of days
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formats a Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date to format
 * @returns string - Formatted date string
 */
export function formatToISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}
