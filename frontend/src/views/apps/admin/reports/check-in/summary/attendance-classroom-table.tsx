import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { ATTENDANCE_STATUSES, formatAttendanceRate } from '@/utils/attendance-summary';

import type { ReactElement } from 'react';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';

const PAGE_SIZE: number = 10;
interface AttendanceClassroomTableProps {
  classrooms: AttendanceSummary['classrooms'];
}

const AttendanceClassroomTable = ({ classrooms }: AttendanceClassroomTableProps): ReactElement => {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const query: string = search.trim().toLocaleLowerCase('th');
  const rows: AttendanceSummary['classrooms'] = classrooms.filter((row): boolean =>
    `${row.name} ${row.departmentName} ${row.levelName}`.toLocaleLowerCase('th').includes(query),
  );
  const currentPage: number = Math.min(page, Math.max(Math.ceil(rows.length / PAGE_SIZE) - 1, 0));
  const visible: AttendanceSummary['classrooms'] = rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              รายละเอียดแยกห้องเรียน
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              แสดงห้องเรียนที่มีข้อมูลเช็คชื่อในภาคเรียนนี้
            </Typography>
          </Box>
          <TextField
            id='attendance-summary-room-search'
            label='ค้นหาห้องเรียนหรือแผนก'
            size='small'
            value={search}
            onChange={(event): void => {
              setSearch(event.target.value);
              setPage(0);
            }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Box>
      </CardContent>
      <TableContainer>
        <Table size='small' aria-label='สรุปการเช็คชื่อแยกห้องเรียน' sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>ห้องเรียน</TableCell>
              <TableCell>แผนกวิชา</TableCell>
              {['มาตรงเวลา', 'มาสาย', 'ขาดเรียน', 'ลา', 'ฝึกงาน', 'อัตราตรงเวลา'].map((label) => (
                <TableCell key={label} align='right'>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ minWidth: 180 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {row.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {row.uniqueStudents.toLocaleString()} คน · บันทึก {row.recordedDays} วัน
                  </Typography>
                </TableCell>
                <TableCell>{row.departmentName}</TableCell>
                {ATTENDANCE_STATUSES.map((status) => (
                  <TableCell key={status.key} align='right'>
                    {row[status.key].toLocaleString()}
                  </TableCell>
                ))}
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  {formatAttendanceRate(row.punctualityRate)}
                </TableCell>
              </TableRow>
            ))}
            {!visible.length && (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  ไม่พบห้องเรียนที่ตรงกับคำค้นหา
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component='div'
        count={rows.length}
        page={currentPage}
        rowsPerPage={PAGE_SIZE}
        rowsPerPageOptions={[PAGE_SIZE]}
        onPageChange={(_event, next: number): void => setPage(next)}
        labelRowsPerPage='ต่อหน้า'
        labelDisplayedRows={({ from, to, count }): string => `${from}–${to} จาก ${count} ห้องเรียน`}
      />
    </Card>
  );
};

export default AttendanceClassroomTable;
