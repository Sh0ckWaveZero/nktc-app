import type { CheckInClassroom, ReportCheckIn } from '@/types/apps/reportCheckIn';
import { formatDateThai, formatLongDateThai } from '@/utils/datetime';

export const ADMIN_ACTIVITY_TYPES = [
  { value: 'CLUB', label: 'กิจกรรมชมรมวิชาชีพ' },
  { value: 'AST', label: 'กิจกรรม อวท.' },
  { value: 'SCOUT', label: 'กิจกรรมลูกเสือ' },
];

export const getActivityTypeLabel = (activityType?: string) => {
  return ADMIN_ACTIVITY_TYPES.find((type) => type.value === activityType)?.label || 'กิจกรรม';
};

const sanitizeFileSegment = (value: string) => {
  return value
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '_');
};

const getNoteEntriesForExport = (row: CheckInClassroom) => {
  if (row.noteEntries?.length) {
    return row.noteEntries;
  }

  if (row.checkInDate) {
    return [{ date: row.checkInDate, note: row.note ?? null }];
  }

  return [];
};

const buildSummaryRows = (rows: CheckInClassroom[]) => {
  return rows.map((row) => [
    row.level?.levelName || '-',
    row.name || '-',
    row.department?.name || '-',
    row.present ?? 0,
    row.presentPercent ?? 0,
    row.absent ?? 0,
    row.absentPercent ?? 0,
    row.total ?? 0,
    row.checkInDate ? formatLongDateThai(row.checkInDate) : '-',
  ]);
};

const buildNoteRows = (rows: CheckInClassroom[]) => {
  const noteRows = rows.flatMap((row) => {
    const noteEntries = getNoteEntriesForExport(row);

    if (noteEntries.length === 0) {
      return [];
    }

    return noteEntries.map((entry) => [
      row.level?.levelName || '-',
      row.name || '-',
      row.department?.name || '-',
      entry.date ? formatLongDateThai(entry.date) : '-',
      entry.note?.trim() || '-',
    ]);
  });

  if (noteRows.length > 0) {
    return noteRows;
  }

  return [['-', '-', '-', '-', 'ไม่มีบันทึกหมายเหตุ']];
};

interface ExportAdminActivityCheckInReportParams {
  report: ReportCheckIn;
  activityType: string;
  reportTitle: string;
  periodLabel: string;
  filePrefix: string;
}

export const exportAdminActivityCheckInReport = async ({
  report,
  activityType,
  reportTitle,
  periodLabel,
  filePrefix,
}: ExportAdminActivityCheckInReportParams) => {
  const rows = report.checkIn ?? [];

  if (rows.length === 0) {
    return;
  }

  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const exportedAt = new Date();
  const activityTypeLabel = getActivityTypeLabel(activityType);

  const summarySheetData = [
    [reportTitle],
    [`ประเภทกิจกรรม: ${activityTypeLabel}`],
    [`ช่วงรายงาน: ${periodLabel}`],
    [`วันที่ส่งออก: ${formatDateThai(exportedAt, { day: '2-digit', month: 'short', year: 'numeric' })}`],
    [],
    ['ระดับชั้น', 'ห้องเรียน', 'แผนกวิชา', 'เข้าร่วม', 'เข้าร่วม(%)', 'ไม่เข้าร่วม', 'ไม่เข้าร่วม(%)', 'รวมทั้งหมด', 'วันที่เช็คชื่อล่าสุด'],
    ...buildSummaryRows(rows),
  ];

  const noteSheetData = [
    ['รายละเอียดหมายเหตุรายวัน'],
    [`ประเภทกิจกรรม: ${activityTypeLabel}`],
    [`ช่วงรายงาน: ${periodLabel}`],
    [`วันที่ส่งออก: ${formatDateThai(exportedAt, { day: '2-digit', month: 'short', year: 'numeric' })}`],
    [],
    ['ระดับชั้น', 'ห้องเรียน', 'แผนกวิชา', 'วันที่', 'หมายเหตุ'],
    ...buildNoteRows(rows),
  ];

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summarySheetData), 'สรุป');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(noteSheetData), 'หมายเหตุรายวัน');

  XLSX.writeFile(
    workbook,
    `${sanitizeFileSegment(filePrefix)}_${sanitizeFileSegment(activityType.toLowerCase())}_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};