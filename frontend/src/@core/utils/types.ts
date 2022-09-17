
export type DateFormatting = {
  localeMatcher?: 'best fit' | 'lookup';
  weekday?: 'long' | 'short' | 'narrow';
  era?: 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  timeZoneName?: 'long' | 'short';
  formatMatcher?: 'best fit' | 'basic';
  hour12?: boolean;

  /**
   * Timezone string must be one of IANA. UTC is a universally required recognizable value
   */
  timeZone?: 'UTC' | string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  calendar?:
  | 'buddhist'
  | 'chinese'
  | ' coptic'
  | 'ethiopia'
  | 'ethiopic'
  | 'gregory'
  | ' hebrew'
  | 'indian'
  | 'islamic'
  | 'iso8601'
  | ' japanese'
  | 'persian'
  | 'roc';
  dayPeriod?: 'narrow' | 'short' | 'long';
  numberingSystem?:
  | 'arab'
  | 'arabext'
  | 'bali'
  | 'beng'
  | 'deva'
  | 'fullwide'
  | ' gujr'
  | 'guru'
  | 'hanidec'
  | 'khmr'
  | ' knda'
  | 'laoo'
  | 'latn'
  | 'limb'
  | 'mlym'
  | ' mong'
  | 'mymr'
  | 'orya'
  | 'tamldec'
  | ' telu'
  | 'thai'
  | 'tibt';
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
  fractionalSecondDigits?: 0 | 1 | 2 | 3;
};

interface MonthYear {
  year: number;
  month: number;
}

interface Fns {
  cardType(cardNumber: string): string;
  formatCardNumber(cardNumber: string): string;
  validateCardNumber(cardNumber: string): boolean;
  validateCardCVC(cvc: string, type?: string): boolean;
  validateCardExpiry(monthYear: string, year?: string): boolean;
  cardExpiryVal(monthYear: string | HTMLInputElement): MonthYear;
}

export type PaymentTypes = {
  fns: Fns;
  formatCardCVC(elem: HTMLInputElement): HTMLInputElement;
  restrictNumeric(elem: HTMLInputElement): HTMLInputElement;
  formatCardNumber(elem: HTMLInputElement): HTMLInputElement;
  formatCardExpiry(elem: HTMLInputElement): HTMLInputElement;
};


export const userRoleType: any = {
  Admin: 'แอดมิน',
  User: 'ผู้ใช้งาน',
  Student: 'นักเรียน',
  Teacher: 'ครู',
  Parent: 'ผู้ปกครอง',
};

export const userStatusType: any = {
  Active: 'เปิดใช้งาน',
  Pending: 'รอการยืนยัน',
  Inactive: 'ปิดใช้งาน',
};

export type Classroom = {
  id?: string;
  classroomId?: string;
  name?: string;
  description?: string;
  levelId?: string;
  programId?: string;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdBy?: string;
  level?: Level;
  program?: Program;
}

export type Level = {
  id?: string;
  levelId?: string;
  levelName?: string;
  levelFullName?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdBy?: string;
}

export type Program = {
  id?: string;
  programId?: string;
  name?: string;
  description?: string;
  levelId?: string;
  departmentId?: string;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdBy?: string;
  level?: Level;
}