'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  LinearProgress,
  TablePagination,
} from '@mui/material';
// Date formatting helpers using date-fns
import { formatThaiShortDate } from '@/@core/utils/thai-calendar';

const formatThaiDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
  }).format(date);
};

interface DailyData {
  date: string;
  checkedIn: number;
  notCheckedIn: number;
  totalStudents: number;
  attendanceRate: number;
}

interface DailyBreakdownTableProps {
  dailyData: DailyData[];
}

const DailyBreakdownTable = ({ dailyData }: DailyBreakdownTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'error';
  };

  const getAttendanceLabel = (rate: number) => {
    if (rate >= 90) return 'ดีมาก';
    if (rate >= 75) return 'ดี';
    if (rate >= 60) return 'พอใช้';
    return 'ต้องปรับปรุง';
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current page data
  const currentPageData = useMemo(() => {
    if (!dailyData) return [];
    return dailyData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [dailyData, page, rowsPerPage]);

  return (
    <Card>
      <CardHeader title='ข้อมูลการมาเข้าแถวรายวัน' subheader={`ทั้งหมด ${dailyData?.length || 0} วัน`} />
      <CardContent>
        {!dailyData || dailyData.length === 0 ? (
          <Box display='flex' justifyContent='center' alignItems='center' py={4}>
            <Typography variant='body1' color='text.secondary'>
              ไม่มีข้อมูล
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              variant='outlined'
              sx={{
                overflowX: 'auto',
                '& .MuiTable-root': {
                  minWidth: { xs: 800, sm: 650 },
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>วันที่</strong>
                    </TableCell>
                    <TableCell align='center' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>มาเข้าแถว</strong>
                    </TableCell>
                    <TableCell align='center' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>ไม่มาเข้าแถว</strong>
                    </TableCell>
                    <TableCell align='center' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>รวมนักเรียน</strong>
                    </TableCell>
                    <TableCell align='center' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>อัตราเข้าเรียน</strong>
                    </TableCell>
                    <TableCell align='center' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>สถานะ</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPageData.map((row, index) => {
                    const checkedIn = row.checkedIn ?? 0;
                    const notCheckedIn = row.notCheckedIn ?? 0;
                    const totalStudents = row.totalStudents ?? 0;
                    // คำนวณอัตราการเข้าเรียนจากข้อมูลจริงที่เช็คชื่อในวันนั้น
                    const actualCheckedStudents = checkedIn + notCheckedIn;
                    const attendanceRate = actualCheckedStudents > 0 ? (checkedIn / actualCheckedStudents) * 100 : 0;

                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography
                            variant='body2'
                            fontWeight={500}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {formatThaiShortDate(row.date)}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          >
                            {formatThaiDayOfWeek(row.date)}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography
                            variant='body2'
                            color='success.main'
                            fontWeight={500}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {checkedIn.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography
                            variant='body2'
                            color='error.main'
                            fontWeight={500}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {notCheckedIn.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography
                            variant='body2'
                            fontWeight={500}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {actualCheckedStudents.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Box sx={{ minWidth: { xs: 60, sm: 80 } }}>
                            <Typography
                              variant='body2'
                              fontWeight={600}
                              color={`${getAttendanceColor(attendanceRate)}.main`}
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {attendanceRate.toFixed(2)}%
                            </Typography>
                            <LinearProgress
                              variant='determinate'
                              value={attendanceRate}
                              color={getAttendanceColor(attendanceRate)}
                              sx={{ mt: 0.5, height: { xs: 4, sm: 6 }, borderRadius: 1 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={getAttendanceLabel(attendanceRate)}
                            color={getAttendanceColor(attendanceRate)}
                            size='small'
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component='div'
              count={dailyData?.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage='แสดง:'
              labelDisplayedRows={({ from, to, count }) => {
                return `${from}-${to} จากทั้งหมด ${count}`;
              }}
              sx={{ mt: 2 }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyBreakdownTable;
