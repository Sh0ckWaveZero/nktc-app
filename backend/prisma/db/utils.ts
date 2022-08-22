import { PrismaClient } from '@prisma/client';
import xlsx from 'node-xlsx';
import * as fs from 'fs'

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
      .filter((item: string) => date.search(item) !== -1)
      .map((item: string) => {
        return (monthThai.indexOf(item) + 1).toString().padStart(2, "0");
      })[0],
  ]);
  const year = await yearThai(date);
  return new Date(`${year}-${monthNumber[0]}-${_date}`);
}

export const yearThai = async (year: string) => {
  const year2digit = year.substring(year.length - 2, year.length).trim();
  const year4digit = year2digit.padStart(4, "25");
  return parseInt(year4digit) - 543;
}


export const getClassroomId = async (level: string) => {
  const res = await prisma.classroom.findFirst({
    where: {
      name: level,
    },
    select: {
      classroomId: true,
    }
  });
  return res?.classroomId;
}

export const getPrgramId = async (program: string, level: string) => {
  const res = await prisma.program.findFirst({
    where: {
      description: program + " " + level,
    },
    select: {
      programId: true,
    }
  });
  return res?.programId;
}

export const readWorkSheeFromFile = (path: string) => {
  const workSheetsFromFile = xlsx.parse(
    fs.readFileSync(`${__dirname}/import/${path}.xlsx`)
  );
  return workSheetsFromFile;
}