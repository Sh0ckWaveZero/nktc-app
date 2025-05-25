import { PrismaClient } from '@prisma/client';
import xlsx from 'node-xlsx';
import * as fs from 'fs';

const prisma = new PrismaClient();

export const getBirthday = async (date: string) => {
  // Handle undefined, null, or empty string input
  if (!date || typeof date !== 'string' || date.trim() === '') {
    console.log('Date is undefined, null or empty');
    return null;
  }

  try {
    // Define Thai month abbreviations
    const monthThai = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];

    // Also include full month names for more robust parsing
    const fullMonthThai = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];

    // Check if string is completely numeric (likely not a Thai date)
    const isNumeric = /^\d+$/.test(date.replace(/\s/g, ''));
    if (isNumeric) {
      console.log(`Date string contains only numbers, not a valid Thai date format: ${date}`);
      return null;
    }

    // Check if the date contains any Thai month format
    const hasThaiMonth = monthThai.some(month => date.includes(month)) ||
      fullMonthThai.some(month => date.includes(month));

    if (!hasThaiMonth) {
      console.log(`No Thai month found in date string: ${date}`);
      return null;
    }

    // Safely extract the day
    let _date = '01';
    try {
      // First try to extract from the beginning of the string
      const dayMatch = date.match(/^(\d{1,2})/);
      if (dayMatch && dayMatch[1]) {
        const dayNum = parseInt(dayMatch[1].trim());
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          _date = dayNum.toString().padStart(2, '0');
        } else {
          console.log(`Invalid day in date string: ${date}, using default day (01)`);
        }
      } else {
        console.log(`Unable to extract day from date string: ${date}, using default day (01)`);
      }
    } catch (error) {
      console.log(`Error extracting day from date string: ${date}, using default day (01)`);
    }

    // Find month number safely - check both abbreviations and full names
    let monthNum = '01';
    try {
      // Check abbreviated month names
      const foundMonths = monthThai
        .filter((item: string) => date.includes(item))
        .map((item: string) => {
          return (monthThai.indexOf(item) + 1).toString().padStart(2, '0');
        });

      // If not found, check full month names
      if (foundMonths.length === 0) {
        const foundFullMonths = fullMonthThai
          .filter((item: string) => date.includes(item))
          .map((item: string) => {
            return (fullMonthThai.indexOf(item) + 1).toString().padStart(2, '0');
          });

        if (foundFullMonths.length > 0) {
          monthNum = foundFullMonths[0];
        }
      } else {
        monthNum = foundMonths[0];
      }
    } catch (error) {
      console.log(`Error extracting month from date string: ${date}, using default month (01)`);
    }

    // Get year safely
    let year = new Date().getFullYear();
    try {
      year = await getBuddhistYear(date);
    } catch (error) {
      console.log(`Error extracting year from date string: ${date}, using current year`);
    }

    // Construct date and validate
    const dateObj = new Date(`${year}-${monthNum}-${_date}`);

    // Final validation check
    if (!isNaN(dateObj.getTime())) {
      // Ensure the date is reasonable (not in the future, not too far in the past)
      const currentYear = new Date().getFullYear();
      if (dateObj.getFullYear() > currentYear) {
        console.log(`Birthday year ${dateObj.getFullYear()} is in the future: ${date}`);
        return null;
      }

      if (dateObj.getFullYear() < 1900) {
        console.log(`Birthday year ${dateObj.getFullYear()} is too far in the past: ${date}`);
        return null;
      }

      return dateObj;
    } else {
      console.log(`Constructed invalid date from string: ${date}`);
      return null;
    }
  } catch (error) {
    console.log(`Error parsing date string: ${date}`, error);
    return null;
  }
};

const getBuddhistYear = async (date: string) => {
  if (!date || typeof date !== 'string') {
    return new Date().getFullYear();
  }

  try {
    const currentYear = new Date().getFullYear();
    const buddhistYearOffset = 543;

    // First, check for 4-digit years in the date string (e.g., 2540, 2545)
    // These would be Buddhist years (BE) and need to be converted to CE
    const fourDigitMatch = date.match(/\b(25[0-9]{2})\b/);
    if (fourDigitMatch && fourDigitMatch[1]) {
      const possibleBuddhistYear = parseInt(fourDigitMatch[1]);
      // If it's a valid Buddhist year in a reasonable range
      if (possibleBuddhistYear >= 2500 && possibleBuddhistYear <= 2600) {
        const westernYear = possibleBuddhistYear - buddhistYearOffset;
        console.log(`Found Buddhist year ${possibleBuddhistYear} in date string, converting to ${westernYear} CE`);
        return westernYear;
      }
    }

    // Also check for Buddhist years in expanded range (2400-2599)
    const expandedYearMatch = date.match(/\b(2[4-5][0-9]{2})\b/);
    if (expandedYearMatch && expandedYearMatch[1]) {
      const possibleBuddhistYear = parseInt(expandedYearMatch[1]);
      // If it's a valid Buddhist year in a reasonable range
      if (possibleBuddhistYear >= 2400 && possibleBuddhistYear <= 2599) {
        const westernYear = possibleBuddhistYear - buddhistYearOffset;
        console.log(`Found Buddhist year ${possibleBuddhistYear} in date string, converting to ${westernYear} CE`);
        return westernYear;
      }
    }

    // For 2-digit years, we need to be more careful
    // Check for digits at the end of the string, which might be years
    const twoDigitRegex = /.*?(\d{1,2})$/;
    const twoDigitMatch = date.match(twoDigitRegex);

    if (twoDigitMatch && twoDigitMatch[1]) {
      let twoDigitYear = twoDigitMatch[1].trim();

      // Ensure we have a 2-digit format (pad with leading zero if needed)
      twoDigitYear = twoDigitYear.padStart(2, '0');

      // Get the current Buddhist century prefix (e.g., '25' for current years)
      // For years in the current century (1957-2056 in CE, which is 2500-2599 in BE)
      const buddhistCenturyPrefix = '25';

      // Construct full year in Buddhist Era
      const fullBuddhistYear = parseInt(`${buddhistCenturyPrefix}${twoDigitYear}`);

      // Convert to Western year
      const westernYear = fullBuddhistYear - buddhistYearOffset;

      // Validate result is a reasonable year
      if (westernYear >= 1900 && westernYear <= (currentYear + 5)) { // Allow a small buffer for future dates
        return westernYear;
      } else {
        console.log(`Calculated unreasonable year (${westernYear}) from date string: ${date}, using current year`);
      }
    }

    // If no year found or invalid, return current year
    return currentYear;
  } catch (error) {
    console.log(`Error in getBuddhistYear for date: ${date}`, error);
    return new Date().getFullYear();
  }
};

export const getClassroomId = async (
  levelClassroomId: string,
  departmentName: string,
  group: string = '',
  programName: string,
) => {
  const name =
    group === 'ปกติ'
      ? `${levelClassroomId}-${programName}`
      : `${levelClassroomId}-${programName} (${group})`;

  const res = await prisma.classroom.findFirst({
    where: {
      name,
    },
    select: {
      id: true,
    },
  });

  return res?.id;
};

export const getLevelClassroomId = async (level: string, classroom: string) => {
  const name = `${level}${classroom}`;
  const res = await prisma.levelClassroom.findFirst({
    where: {
      name: name,
    },
    select: {
      id: true,
    },
  });
  return res?.id;
};

export const getLevelClassroomByName = async (name: string) => {
  const res = await prisma.levelClassroom.findFirst({
    where: {
      name: name,
    },
    select: {
      id: true,
    },
  });
  return res?.id;
};

export const getProgramId = async (
  level: string,
  programName: string = '',
  group: string = '',
) => {
  const query = group === 'ปกติ' ? programName : `${programName} (${group})`;

  const res = await prisma.program.findFirst({
    where: {
      name: query,
      levelId: level,
    },
    select: {
      id: true,
    },
  });
  return res?.id;
};

export const readWorkSheetFromFile = (path: string) => {
  const workSheetsFromFile = xlsx.parse(
    fs.readFileSync(
      `${process.cwd()}/src/database/db/nktc-services/db/import/${path}.xlsx`,
    ),
  );
  return workSheetsFromFile;
};

export const getLevelByName = async (level: 'ปวช.' | 'ปวส.') => {
  const admin = createByAdmin();
  const isLevel = level === 'ปวช.' ? 'L001' : 'L002';

  const res = await prisma.level.findFirst({
    where: {
      levelId: isLevel,
    },
  });

  return {
    ...admin,
    level: {
      connect: {
        id: res?.id,
      },
    },
  };
};

export const getLevelId = async (level: string) => {
  try {
    const res = await prisma.level.findFirstOrThrow({
      where: {
        OR: [
          { levelId: level },
          { levelName: level },
        ]
      },
    });

    return res;
  } catch (error) {
    console.error('Error fetching level ID:', { level, error });
    throw error;
  }
};

export const getDepartIdByName = async (name: string, id: string) => {
  const names = name.trim();
  const res = await prisma.department.findFirst({
    where: {
      departmentId: names,
    },
  });
  return res.id;
};

export const getDepartId = async (name: string, id: string) => {
  const names = name.trim();
  const res = await prisma.department.findFirst({
    where: {
      departmentId: names,
    },
  });
  return res;
};

export const createByAdmin = () => {
  const startDate = new Date();
  return {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };
};

export const isEmpty = (obj: any) =>
  [Object, Array].includes((obj || {}).constructor) &&
  !Object.entries(obj || {}).length;

export const isValidHttpUrl = (string: any) => {
  try {
    const newUrl = new URL(string);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

const nameNumberRegex = /^([^\d]+)(\d+\/\d+)-(.*)$/;

export const sortClassroomsByNumberAndDepartment = (classrooms: any) => {
  const sortedClassrooms = classrooms.sort((a: any, b: any) => {
    const [, prefixA, numberA, suffixA] = a.name.match(nameNumberRegex);
    const [, prefixB, numberB, suffixB] = b.name.match(nameNumberRegex);

    if (prefixA === prefixB) {
      const [majorA, minorA] = numberA.split('/');
      const [majorB, minorB] = numberB.split('/');

      if (majorA === majorB) {
        if (minorA === minorB) {
          return suffixA.localeCompare(suffixB);
        }
        return Number(minorA) - Number(minorB);
      }
      return Number(majorA) - Number(majorB);
    }

    return prefixA.localeCompare(prefixB);
  });

  const sortedClassroomsByDepartment = sortedClassrooms.sort(
    (a: any, b: any) => {
      if (a.department.name === b.department.name) {
        return 0;
      }
      return a.department.name > b.department.name ? 1 : -1;
    },
  );

  return sortedClassroomsByDepartment;
};
