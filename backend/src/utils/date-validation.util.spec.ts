import { BadRequestException } from '@nestjs/common';
import {
  isValidDate,
  validateAndParseDate,
  validateDateRange,
  setStartOfDay,
  setEndOfDay,
  validateAndPrepareDateRange,
  isDateInRange,
  getDaysBetween,
  formatToISODate,
} from './date-validation.util';

describe('Date Validation Utils', () => {
  describe('isValidDate', () => {
    it('should return true for valid date strings', () => {
      expect(isValidDate('2024-01-01')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('2024-06-15T10:30:00Z')).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2024-13-01')).toBe(false); // Invalid month
      expect(isValidDate('')).toBe(false);
      expect(isValidDate(null as any)).toBe(false);
      expect(isValidDate(undefined as any)).toBe(false);
    });
  });

  describe('validateAndParseDate', () => {
    it('should parse valid date strings', () => {
      const date = validateAndParseDate('2024-01-01', 'วันที่ทดสอบ');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(1);
    });

    it('should throw BadRequestException for invalid date strings', () => {
      expect(() => validateAndParseDate('invalid-date', 'วันที่ทดสอบ')).toThrow(
        BadRequestException,
      );
      expect(() => validateAndParseDate('', 'วันที่ทดสอบ')).toThrow(
        BadRequestException,
      );
      expect(() => validateAndParseDate(null as any, 'วันที่ทดสอบ')).toThrow(
        BadRequestException,
      );
    });

    it('should use custom field name in error message', () => {
      try {
        validateAndParseDate('invalid', 'วันที่เริ่มต้น');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('วันที่เริ่มต้น');
      }
    });
  });

  describe('validateDateRange', () => {
    it('should not throw for valid date ranges', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      expect(() => validateDateRange(startDate, endDate)).not.toThrow();
    });

    it('should not throw when start date equals end date', () => {
      const date = new Date('2024-06-15');
      expect(() => validateDateRange(date, date)).not.toThrow();
    });

    it('should throw BadRequestException when start date is after end date', () => {
      const startDate = new Date('2024-12-31');
      const endDate = new Date('2024-01-01');
      expect(() => validateDateRange(startDate, endDate)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('setStartOfDay', () => {
    it('should set time to 00:00:00.000', () => {
      const date = new Date('2024-06-15T14:30:45.123Z');
      const startOfDay = setStartOfDay(date);

      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
      expect(startOfDay.getSeconds()).toBe(0);
      expect(startOfDay.getMilliseconds()).toBe(0);
    });

    it('should not modify original date', () => {
      const original = new Date('2024-06-15T14:30:45.123Z');
      const originalTime = original.getTime();
      setStartOfDay(original);

      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('setEndOfDay', () => {
    it('should set time to 23:59:59.999', () => {
      const date = new Date('2024-06-15T10:30:00.000Z');
      const endOfDay = setEndOfDay(date);

      expect(endOfDay.getHours()).toBe(23);
      expect(endOfDay.getMinutes()).toBe(59);
      expect(endOfDay.getSeconds()).toBe(59);
      expect(endOfDay.getMilliseconds()).toBe(999);
    });

    it('should not modify original date', () => {
      const original = new Date('2024-06-15T10:30:00.000Z');
      const originalTime = original.getTime();
      setEndOfDay(original);

      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('validateAndPrepareDateRange', () => {
    it('should return validated and prepared date range', () => {
      const result = validateAndPrepareDateRange('2024-01-01', '2024-12-31');

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);

      // Check start of day
      expect(result.startDate.getHours()).toBe(0);
      expect(result.startDate.getMinutes()).toBe(0);

      // Check end of day
      expect(result.endDate.getHours()).toBe(23);
      expect(result.endDate.getMinutes()).toBe(59);
    });

    it('should throw for invalid date strings', () => {
      expect(() =>
        validateAndPrepareDateRange('invalid', '2024-12-31'),
      ).toThrow(BadRequestException);

      expect(() =>
        validateAndPrepareDateRange('2024-01-01', 'invalid'),
      ).toThrow(BadRequestException);
    });

    it('should throw when start date is after end date', () => {
      expect(() =>
        validateAndPrepareDateRange('2024-12-31', '2024-01-01'),
      ).toThrow(BadRequestException);
    });
  });

  describe('isDateInRange', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    it('should return true for dates within range', () => {
      const dateInRange = new Date('2024-06-15');
      expect(isDateInRange(dateInRange, startDate, endDate)).toBe(true);
    });

    it('should return true for boundary dates', () => {
      expect(isDateInRange(startDate, startDate, endDate)).toBe(true);
      expect(isDateInRange(endDate, startDate, endDate)).toBe(true);
    });

    it('should return false for dates outside range', () => {
      const beforeRange = new Date('2023-12-31');
      const afterRange = new Date('2025-01-01');

      expect(isDateInRange(beforeRange, startDate, endDate)).toBe(false);
      expect(isDateInRange(afterRange, startDate, endDate)).toBe(false);
    });
  });

  describe('getDaysBetween', () => {
    it('should calculate days between dates correctly', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-31');

      expect(getDaysBetween(date1, date2)).toBe(30);
    });

    it('should work regardless of date order', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-31');

      expect(getDaysBetween(date1, date2)).toBe(getDaysBetween(date2, date1));
    });

    it('should return 0 for same dates', () => {
      const date = new Date('2024-06-15');
      expect(getDaysBetween(date, date)).toBe(0);
    });
  });

  describe('formatToISODate', () => {
    it('should format date to ISO string (YYYY-MM-DD)', () => {
      const date = new Date('2024-06-15T14:30:00.000Z');
      const formatted = formatToISODate(date);

      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(formatted).toBe('2024-06-15');
    });

    it('should handle different dates correctly', () => {
      expect(formatToISODate(new Date('2024-01-01'))).toBe('2024-01-01');
      expect(formatToISODate(new Date('2024-12-31'))).toBe('2024-12-31');
    });
  });
});
