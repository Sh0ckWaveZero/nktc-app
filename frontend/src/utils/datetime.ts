/**
 * Date Format Options Type
 */
export type DateFormatOptions = Intl.DateTimeFormatOptions;

/**
 * Format date using Intl.DateTimeFormat with Thai Buddhist calendar (พ.ศ.)
 * @param date - Date object, string, or number timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Thai
 *
 * @example
 * formatDateThai(new Date(), { dateStyle: 'full' })
 * // "วันพฤหัสบดีที่ 17 ตุลาคม พ.ศ. 2568"
 *
 * formatDateThai(new Date(), { year: 'numeric', month: 'long', day: 'numeric' })
 * // "17 ตุลาคม 2568"
 */
export function formatDateThai(
  date: Date | string | number,
  options: DateFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', options).format(dateObj);
}

/**
 * Format date using Intl.DateTimeFormat with Gregorian calendar (ค.ศ.)
 * @param date - Date object, string, or number timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Thai with Gregorian year
 *
 * @example
 * formatDateThaiGregorian(new Date(), { dateStyle: 'full' })
 * // "วันพฤหัสบดีที่ 17 ตุลาคม ค.ศ. 2025"
 */
export function formatDateThaiGregorian(
  date: Date | string | number,
  options: DateFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH', options).format(dateObj);
}

/**
 * Format date with short format (DD/MM/YYYY in Buddhist year)
 * @example formatShortDateThai(new Date()) // "17/10/2568"
 */
export function formatShortDateThai(date: Date | string | number): string {
  return formatDateThai(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date with long format (Thai full date)
 * @example formatLongDateThai(new Date()) // "17 ตุลาคม 2568"
 */
export function formatLongDateThai(date: Date | string | number): string {
  return formatDateThai(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date with full format including day name
 * @example formatFullDateThai(new Date()) // "วันพฤหัสบดีที่ 17 ตุลาคม พ.ศ. 2568"
 */
export function formatFullDateThai(date: Date | string | number): string {
  return formatDateThai(date, {
    dateStyle: 'full',
  });
}

/**
 * Format time in Thai format
 * @example formatTimeThai(new Date()) // "14:30:45"
 */
export function formatTimeThai(date: Date | string | number, includeSeconds: boolean = false): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
    hour12: false,
  }).format(dateObj);
}

/**
 * Format date and time together
 * @example formatDateTimeThai(new Date()) // "17 ตุลาคม 2568 เวลา 14:30"
 */
export function formatDateTimeThai(date: Date | string | number, includeSeconds: boolean = false): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
    hour12: false,
  }).format(dateObj);
}

/**
 * Get Thai day name
 * @example getThaiDayName(new Date()) // "วันพฤหัสบดี"
 */
export function getThaiDayName(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH', { weekday: 'long' }).format(dateObj);
}

/**
 * Get Thai month name
 * @example getThaiMonthName(new Date()) // "ตุลาคม"
 */
export function getThaiMonthName(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(dateObj);
}

/**
 * Get Buddhist year (พ.ศ.)
 * @example getBuddhistYear(new Date()) // "2568"
 */
export function getBuddhistYear(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { year: 'numeric' }).format(dateObj);
}

/**
 * Calculate time ago in Thai
 */
export function calculateTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 60) {
    return 'เมื่อสักครู่นี้';
  } else if (diffMinutes < 60) {
    return `เมื่อ ${diffMinutes} นาทีที่แล้ว`;
  } else if (diffHours < 24) {
    return `เมื่อ ${diffHours} ชั่วโมงที่แล้ว`;
  } else if (diffDays < 7) {
    return `เมื่อ ${diffDays} วันที่แล้ว`;
  } else {
    return formatLongDateThai(date);
  }
}
