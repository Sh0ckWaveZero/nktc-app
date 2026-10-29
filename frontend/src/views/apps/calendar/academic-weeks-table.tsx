'use client';

import {
  Alert,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { formatThaiDate } from '@/@core/utils/thai-calendar';
import type { AcademicCalendarSettings } from '@/types/apps/academic-calendar';
import { getAcademicWeekNumber, getAcademicWeeks } from '@/utils/academic-calendar';

interface AcademicWeeksTableProps {
  settings: AcademicCalendarSettings | null;
  today: Date;
}

const AcademicWeeksTable = ({ settings, today }: AcademicWeeksTableProps) => {
  if (!settings) return <Alert severity='info'>กรุณาตั้งค่าวันเปิดภาคเรียนเพื่อแสดงตารางสัปดาห์</Alert>;

  const weeks = getAcademicWeeks(settings);
  const currentWeek = getAcademicWeekNumber(settings, today);
  const name = settings.selectedTerm === 1 ? settings.term1Name : settings.term2Name;

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ fontWeight: 700 }}>ตารางแจกแจง 18 สัปดาห์</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {name} · ปวส. เรียน 15 สัปดาห์ และ ปวช. เรียน 18 สัปดาห์
        </Typography>
        <TableContainer>
          <Table id='academic-weeks-table' size='small' aria-label='ตารางสัปดาห์ภาคเรียน'>
            <TableHead>
              <TableRow>
                <TableCell>สัปดาห์</TableCell>
                <TableCell>ช่วงวันที่</TableCell>
                <TableCell>ระดับชั้นที่เรียน</TableCell>
                <TableCell>หมายเหตุ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week) => (
                <TableRow key={week.number} selected={week.number === currentWeek}>
                  <TableCell>{week.number}</TableCell>
                  <TableCell>{formatThaiDate(week.start)} – {formatThaiDate(week.end)}</TableCell>
                  <TableCell>{week.includesDiploma ? 'ปวส. และ ปวช.' : 'ปวช.'}</TableCell>
                  <TableCell>
                    {week.number === currentWeek && <Chip size='small' color='success' label='สัปดาห์ปัจจุบัน' sx={{ mr: 1 }} />}
                    {week.number === 15 && <Chip size='small' color='info' label='สิ้นสุด ปวส.' />}
                    {week.number === 18 && <Chip size='small' color='warning' label='สิ้นสุด ปวช.' />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default AcademicWeeksTable;
