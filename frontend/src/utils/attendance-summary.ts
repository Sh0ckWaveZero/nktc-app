import { parseISO } from 'date-fns';

import { formatThaiDate } from '@/@core/utils/thai-calendar';

import type { AttendanceSummary } from '@/types/apps/attendance-summary';

export const ATTENDANCE_STATUSES = [
  { key: 'present', label: 'มาตรงเวลา', color: '#22c55e' },
  { key: 'late', label: 'มาสาย', color: '#f59e0b' },
  { key: 'absent', label: 'ขาดเรียน', color: '#f43f5e' },
  { key: 'leave', label: 'ลา', color: '#38bdf8' },
  { key: 'internship', label: 'ฝึกงาน', color: '#a78bfa' },
] as const;

export interface AttendanceInsight {
  title: string;
  body: string;
  tone: 'info' | 'success' | 'warning';
}

/** แสดง Percent เป็นขีดเมื่อไม่มีสถานะที่ใช้เป็นตัวหาร */
export const formatAttendanceRate = (rate: number | null): string => (rate === null ? '—' : `${rate.toFixed(2)}%`);

/** สรุป Insight จากยอดจริง โดยไม่ตั้งเกณฑ์ผ่าน/ไม่ผ่านแทนสถานศึกษา */
export const getAttendanceInsights = (data: AttendanceSummary): AttendanceInsight[] => {
  const eligible: number = data.totals.present + data.totals.absent + data.totals.late;
  const result: AttendanceInsight[] = [
    {
      title: 'ภาพรวมจากข้อมูลที่บันทึก',
      body: `มีข้อมูล ${data.recordedDays.toLocaleString()} วัน จากนักเรียน ${data.uniqueStudents.toLocaleString()} คน ใน ${data.classroomsCount.toLocaleString()} ห้องเรียน รวม ${data.totals.total.toLocaleString()} ครั้ง`,
      tone: 'info',
    },
  ];
  const recordedWeeks: AttendanceSummary['weekly'] = data.weekly.filter(
    (week): boolean => week.punctualityRate !== null,
  );
  const latest: AttendanceSummary['weekly'][number] | undefined = recordedWeeks[recordedWeeks.length - 1];
  const previous: AttendanceSummary['weekly'][number] | undefined = recordedWeeks[recordedWeeks.length - 2];
  if (latest && previous && latest.week === previous.week + 1) {
    const difference: number = (latest.punctualityRate ?? 0) - (previous.punctualityRate ?? 0);
    result.push({
      title: 'แนวโน้มสัปดาห์ล่าสุดที่มีข้อมูล',
      body: `สัปดาห์ที่ ${latest.week} ตรงเวลา ${formatAttendanceRate(latest.punctualityRate)} ${difference === 0 ? 'เท่ากับ' : difference > 0 ? 'เพิ่มขึ้น' : 'ลดลง'}${difference === 0 ? '' : ` ${Math.abs(difference).toFixed(2)} จุดเปอร์เซ็นต์`} เทียบกับสัปดาห์ที่ ${previous.week}${latest.endDate > data.period.throughDate ? ' (สัปดาห์ล่าสุดยังอาจบันทึกไม่ครบ)' : ''}`,
      tone: difference < 0 ? 'warning' : 'success',
    });
  } else {
    result.push({
      title: 'แนวโน้มรายสัปดาห์',
      body: 'ยังไม่มีข้อมูลสองสัปดาห์ต่อเนื่องสำหรับเปรียบเทียบแนวโน้ม วันที่ยังไม่บันทึกจะไม่ถูกนับเป็นขาดเรียน',
      tone: 'info',
    });
  }
  result.push({
    title: 'อ่านสถานะให้ครบ',
    body: `มาตรงเวลา ${data.totals.present.toLocaleString()} ครั้ง มาสาย ${data.totals.late.toLocaleString()} ครั้ง และขาด ${data.totals.absent.toLocaleString()} ครั้ง จาก ${eligible.toLocaleString()} ครั้งที่ใช้คำนวณอัตราตรงเวลา ส่วนลา ${data.totals.leave.toLocaleString()} และฝึกงาน ${data.totals.internship.toLocaleString()} ครั้งแสดงแยก`,
    tone: 'info',
  });
  return result;
};

/** Export สถิติและคำอธิบายตัวหารเป็น Excel โดยใช้ช่วงภาคเรียนที่ Backend สรุป */
export const exportAttendanceSummary = async (data: AttendanceSummary): Promise<void> => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const metadata: (string | number)[][] = [
    ['สรุปสถิติหน้าเสาธงรายภาคเรียน'],
    ['ปีการศึกษา', data.period.academicYear, 'ภาคเรียน', data.period.term, data.period.name],
    [
      'วันเปิดเทอม',
      formatThaiDate(parseISO(data.period.startDate)),
      'วันสิ้นสุดภาคเรียน',
      formatThaiDate(parseISO(data.period.endDate)),
    ],
    ['สรุปข้อมูลถึง', formatThaiDate(parseISO(data.period.throughDate))],
    ['วิธีนับ', 'นักเรียนหนึ่งคนต่อหนึ่งวัน = หนึ่งครั้ง ใช้ข้อมูลล่าสุดเมื่อบันทึกซ้ำ'],
    ['อัตรามาตรงเวลา', 'มา / (มา + สาย + ขาด) ไม่รวมลาและฝึกงาน วันที่ไม่มีข้อมูลไม่นับเป็นขาด'],
    [],
  ];
  const statusHeaders: string[] = ['มาตรงเวลา', 'มาสาย', 'ขาดเรียน', 'ลา', 'ฝึกงาน', 'รวมครั้ง', 'อัตราตรงเวลา (%)'];
  const counts = (row: AttendanceSummary['totals']): (number | string)[] => [
    row.present,
    row.late,
    row.absent,
    row.leave,
    row.internship,
    row.total,
    row.punctualityRate ?? 'ไม่มีข้อมูล',
  ];
  const sheets: { name: string; rows: (string | number)[][] }[] = [
    {
      name: 'ภาพรวม',
      rows: [
        ...metadata,
        ['นักเรียนที่มีข้อมูล (คน)', data.uniqueStudents],
        ['วันที่บันทึก (วัน)', data.recordedDays],
        ['ห้องเรียนที่มีข้อมูล', data.classroomsCount],
        statusHeaders,
        counts(data.totals),
        ['รายการซ้ำที่ตัดออก', data.quality.duplicateEntries],
        ['รายการขัดแย้งที่ไม่รวมยอด', data.quality.conflictingStudentDays],
      ],
    },
    {
      name: 'รายสัปดาห์',
      rows: [
        ...metadata,
        ['สัปดาห์', 'เริ่ม', 'สิ้นสุด', 'วันที่บันทึก', ...statusHeaders],
        ...data.weekly.map((row) => [row.week, row.startDate, row.endDate, row.recordedDays, ...counts(row)]),
      ],
    },
    {
      name: 'แผนกวิชา',
      rows: [
        ...metadata,
        ['แผนก', 'นักเรียนที่มีข้อมูล', ...statusHeaders],
        ...data.departments.map((row) => [row.name, row.uniqueStudents, ...counts(row)]),
      ],
    },
    {
      name: 'ห้องเรียน',
      rows: [
        ...metadata,
        ['ห้องเรียน', 'แผนก', 'ระดับชั้น', 'นักเรียนที่มีข้อมูล', 'วันที่บันทึก', ...statusHeaders],
        ...data.classrooms.map((row) => [
          row.name,
          row.departmentName,
          row.levelName,
          row.uniqueStudents,
          row.recordedDays,
          ...counts(row),
        ]),
      ],
    },
  ];
  for (const sheet of sheets) XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheet.rows), sheet.name);
  XLSX.writeFile(workbook, `flagpole_summary_${data.period.academicYear}_term_${data.period.term}.xlsx`);
};
