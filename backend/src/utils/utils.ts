import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

export const getBirthday = async (date: string) => {
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
  const _date = date.substring(0, 2).trim();
  const monthNumber = await Promise.all([
    monthThai
      .filter((item: string) => date.search(item) > -1)
      .map((item: string) => {
        return (monthThai.indexOf(item) + 1).toString().padStart(2, '0');
      })[0],
  ]);
  const year = await getBuddhistYear(date);
  return new Date(`${year}-${monthNumber[0]}-${_date}`);
};

const getBuddhistYear = async (date: string) => {
  const year = new Date().getFullYear();
  const buddhistYear = 543;
  const twoDigitBuddhistYear = (year + buddhistYear).toString().substring(0, 2);
  const twoDigitYear = date.substring(date.length - 2, date.length).trim();
  const fourDigitYear = twoDigitYear.padStart(4, twoDigitBuddhistYear);
  return parseInt(fourDigitYear) - buddhistYear;
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
  programName: string,
  level: string,
) => {
  // find level
  const levelIds = await getLevelId(level);
  const levelId = levelIds[level];

  const res = await prisma.program.findFirst({
    where: {
      name: programName,
      levelId: levelId,
    },
    select: {
      id: true,
    },
  });

  return res?.id;
};

export const readWorkSheetFromFile = (filename: string) => {
  try {
    if (!path) {
      throw new Error("Path module is not properly loaded");
    }

    // Use process.cwd() to get the project root directory
    const projectRoot = process.cwd();

    // Construct the file path using path.join for cross-platform compatibility
    const filePath = path.join(
      projectRoot,
      'src',
      'database',
      'db',
      'nktc-services',
      'db',
      'import',
      `${filename}.xlsx`
    );

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      // Check if directory exists
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        console.error(`Directory not found: ${dirPath}`);
        // Try to create directories if they don't exist
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      }
      return [];
    }

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);

    // Process all sheets and extract data
    return workbook.SheetNames.map(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      return { name: sheetName, data };
    });
  } catch (error) {
    console.error('Error reading worksheet file:', error);
    return [];
  }
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

export const getLevelId = async (levelName: string): Promise<any> => {
  // Import the new function to avoid duplicate code
  const { getLevelId: newGetLevelId } = require('./levelUtils');
  return newGetLevelId(levelName);
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
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
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
