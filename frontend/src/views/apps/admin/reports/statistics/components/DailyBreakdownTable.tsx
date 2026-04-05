'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

import type { DailyBreakdownDatum } from '@/hooks/queries/useStatistics';

const formatThaiShortDate = (value: string) =>
  new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
  }).format(new Date(value));

const formatThaiWeekday = (value: string) =>
  new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
  }).format(new Date(value));

const getAttendanceTone = (rate: number) => {
  if (rate >= 90) {
    return 'success';
  }

  if (rate >= 75) {
    return 'warning';
  }

  return 'error';
};

const getAttendanceLabel = (rate: number) => {
  if (rate >= 90) {
    return 'ดีมาก';
  }

  if (rate >= 75) {
    return 'ควบคุมได้';
  }

  return 'ต้องติดตาม';
};

interface DailyBreakdownTableProps {
  dailyData: DailyBreakdownDatum[];
}

const DailyBreakdownTable = ({ dailyData }: DailyBreakdownTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const currentRows = useMemo(
    () => dailyData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [dailyData, page, rowsPerPage]
  );

  const handleChangePage = (_event: unknown, nextPage: number) => {
    setPage(nextPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
      }}
    >
      <CardHeader
        title='สถิติรายวัน'
        subheader={`เรียงตามวันจริง ${dailyData.length.toLocaleString()} วัน`}
        slotProps={{
          title: {
            sx: {
              fontWeight: 800,
              letterSpacing: '-0.03em',
            },
          },
          subheader: {
            sx: {
              mt: 0.75,
            },
          },
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box
          sx={{
            mb: 2,
            p: 1.35,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
          }}
        >
          <Typography sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            ตารางคะแนนรายวัน
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            แยก มาเข้าแถว ขาด สาย ลา และฝึกงาน ต่อวัน
          </Typography>
        </Box>

        <TableContainer
          sx={{
            borderRadius: 2.5,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08)}`,
            overflowX: 'auto',
          }}
        >
          <Table sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    py: 1.8,
                    fontWeight: 800,
                    color: 'text.primary',
                    borderBottom: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05),
                  },
                }}
              >
                <TableCell>วันที่</TableCell>
                <TableCell align='center'>มาเข้าแถว</TableCell>
                <TableCell align='center'>ขาด</TableCell>
                <TableCell align='center'>สาย</TableCell>
                <TableCell align='center'>ลา</TableCell>
                <TableCell align='center'>ฝึกงาน</TableCell>
                <TableCell align='center'>เช็คชื่อรวม</TableCell>
                <TableCell align='center'>อัตราเข้าแถว</TableCell>
                <TableCell align='center'>สถานะ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 8 }}>
                    <Typography color='text.secondary'>ไม่พบข้อมูลรายวันในช่วงวันที่นี้</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentRows.map((row) => {
                  const tone = getAttendanceTone(row.attendanceRate);

                  return (
                    <TableRow
                      key={row.date}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.035),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>{formatThaiShortDate(row.date)}</Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          {formatThaiWeekday(row.date)}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>{row.present.toLocaleString()}</TableCell>
                      <TableCell align='center'>{row.absent.toLocaleString()}</TableCell>
                      <TableCell align='center'>{row.late.toLocaleString()}</TableCell>
                      <TableCell align='center'>{row.leave.toLocaleString()}</TableCell>
                      <TableCell align='center'>{row.internship.toLocaleString()}</TableCell>
                      <TableCell align='center'>
                        <Typography sx={{ fontWeight: 700 }}>{row.checkedRecords.toLocaleString()}</Typography>
                        <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
                          จาก {row.totalStudents.toLocaleString()} คน
                        </Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ minWidth: 160 }}>
                        <Box sx={{ px: 1 }}>
                          <Typography sx={{ fontWeight: 800, color: `${tone}.main` }}>
                            {row.attendanceRate.toFixed(2)}%
                          </Typography>
                          <LinearProgress
                            variant='determinate'
                            value={row.attendanceRate}
                            color={tone}
                            sx={{
                              mt: 0.8,
                              height: 8,
                              borderRadius: 999,
                              bgcolor: (theme) => alpha(theme.palette[tone].main, 0.12),
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={getAttendanceLabel(row.attendanceRate)}
                          color={tone}
                          size='small'
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={dailyData.length === 0 ? [] : [10, 25, 50]}
          component='div'
          count={dailyData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={dailyData.length === 0 ? '' : 'แสดง'}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  );
};

export default DailyBreakdownTable;
