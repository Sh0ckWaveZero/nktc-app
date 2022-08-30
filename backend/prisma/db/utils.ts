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
      .filter((item: string) => date.search(item) > -1)
      .map((item: string) => {
        return (monthThai.indexOf(item) + 1).toString().padStart(2, "0");
      })[0],
  ]);
  const year = await getBuddhistYear(date);
  return new Date(`${year}-${monthNumber[0]}-${_date}`);
}

const getBuddhistYear = async (date: string) => {
  const year = new Date().getFullYear();
  const buddhistYear = 543;
  const twoDigitBuddhistYear = (year + buddhistYear).toString().substring(2, 4);
  const twoDigitYear = date.substring(date.length - 2, date.length).trim();
  const fourDigitYear = twoDigitYear.padStart(4, twoDigitBuddhistYear);
  return parseInt(fourDigitYear) - buddhistYear;
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

export const getLevelClassroomId = async (level: string, classroom: string) => {
  const name = `${level}${classroom}`;
  console.log("🚀 ~ file: utils.ts ~ line 57 ~ getLevelClassroomId ~ name", name)
  const res = await prisma.levelClassroom.findFirst({
    where: {
      name: name,
    },
    select: {
      levelClassroomId: true,
    }
  });
  return res?.levelClassroomId;
}

export const getProgramId = async (name: string, level: string) => {
  const res = await prisma.program.findFirst({
    where: {
      description: name + " " + level,
    },
    select: {
      programId: true,
    }
  });
  return res?.programId;
}

export const readWorkSheetFromFile = (path: string) => {
  const workSheetsFromFile = xlsx.parse(
    fs.readFileSync(`${__dirname}/import/${path}.xlsx`)
  );
  return workSheetsFromFile;
}