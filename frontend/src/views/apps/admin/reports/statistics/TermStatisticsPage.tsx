'use client';

import { useEffect, useMemo, useState } from 'react';
import { alpha, styled, type Theme } from '@mui/material/styles';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { FaChalkboardTeacher, FaChartLine, FaFileExcel, FaUserGraduate } from 'react-icons/fa';
import { MdAssessment } from 'react-icons/md';
import * as XLSX from 'xlsx';

import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import {
  formatDateForAPI,
  formatThaiDate,
  getEndOfMonth,
  getStartOfMonth,
} from '@/@core/components/mui/date-picker-thai/utils';
import { useDepartments, usePrograms, useTermStatistics, type DailyBreakdownDatum } from '@/hooks/queries';

import AttendanceChart from './components/AttendanceChart';
import DailyAttendanceChart from './components/DailyAttendanceChart';
import DailyBreakdownTable from './components/DailyBreakdownTable';
import StatisticsCard from './components/StatisticsCard';
import TeacherActivityTable from './components/TeacherActivityTable';
import TeacherUsageChart from './components/TeacherUsageChart';

const PANEL_RADIUS = 14;
const SECTION_RADIUS = 12;
const CONTROL_RADIUS = 10;

const HeroCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: PANEL_RADIUS,
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 18%, ${alpha(theme.palette.background.default, 0.98)} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.background.paper, 0.995)} 20%, ${theme.palette.background.paper} 100%)`,
  boxShadow:
    theme.palette.mode === 'dark'
      ? `0 26px 54px ${alpha(theme.palette.common.black, 0.2)}`
      : `0 26px 52px ${alpha(theme.palette.primary.main, 0.08)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -140,
    right: -90,
    width: 340,
    height: 340,
    borderRadius: '50%',
    pointerEvents: 'none',
    background:
      theme.palette.mode === 'dark'
        ? `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.16)} 0%, transparent 72%)`
        : `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.14)} 0%, transparent 74%)`,
  },
}));

const FilterSurface = styled(Box)(({ theme }) => ({
  borderRadius: SECTION_RADIUS,
  padding: theme.spacing(2.25),
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08)}`,
  backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.92),
  boxShadow:
    theme.palette.mode === 'dark'
      ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.03)}`
      : `0 16px 32px ${alpha(theme.palette.primary.main, 0.04)}`,
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontWeight: 800,
  letterSpacing: '-0.03em',
  fontSize: '1.05rem',
  color: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.9 : 0.82),
  '&::before': {
    content: '""',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.74 : 0.64),
    boxShadow:
      theme.palette.mode === 'dark'
        ? `0 0 0 6px ${alpha(theme.palette.primary.main, 0.08)}`
        : `0 0 0 5px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

const HeroEyebrow = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '0.8rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.94 : 0.8),
}));

const ChartSurface = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.94)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.995)} 0%, ${alpha(theme.palette.primary.main, 0.018)} 100%)`,
  boxShadow:
    theme.palette.mode === 'dark'
      ? `0 18px 36px ${alpha(theme.palette.common.black, 0.16)}`
      : `0 18px 34px ${alpha(theme.palette.primary.main, 0.05)}`,
}));

const CONTROL_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: `${CONTROL_RADIUS}px`,
    backgroundColor: (theme: Theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 0.94),
    '& fieldset': {
      borderColor: (theme: Theme) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.18 : 0.12),
    },
    '&:hover fieldset': {
      borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.24),
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  },
  '& .MuiInputBase-input': {
    fontWeight: 400,
  },
} as const;

const EmptyStateCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px dashed ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.26 : 0.2)}`,
  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.06 : 0.03),
}));

const formatThaiDateTime = (value: string) =>
  new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    const response = 'response' in error ? (error as { response?: { data?: { message?: unknown } } }).response : undefined;
    if (typeof response?.data?.message === 'string') {
      return response.data.message;
    }

    const errorMessage = 'message' in error ? (error as { message?: unknown }).message : undefined;
    if (typeof errorMessage === 'string') {
      return errorMessage;
    }
  }

  return 'เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ';
};

const findBestAndWorstDay = (dailyBreakdown: DailyBreakdownDatum[]) => {
  if (dailyBreakdown.length === 0) {
    return {
      bestDay: null,
      worstDay: null,
    };
  }

  const sorted = [...dailyBreakdown].sort((left, right) => left.attendanceRate - right.attendanceRate);

  return {
    worstDay: sorted[0] ?? null,
    bestDay: sorted[sorted.length - 1] ?? null,
  };
};

const StatisticsSkeleton = () => (
  <Grid container spacing={3}>
    <Grid size={12}>
      <HeroCard>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Skeleton variant='rounded' height={180} sx={{ borderRadius: 4 }} />
        </CardContent>
      </HeroCard>
    </Grid>
    {[0, 1, 2, 3].map((item) => (
      <Grid key={item} size={{ xs: 12, sm: 6, xl: 3 }}>
        <Skeleton variant='rounded' height={176} sx={{ borderRadius: 4 }} />
      </Grid>
    ))}
    <Grid size={{ xs: 12, xl: 8 }}>
      <Skeleton variant='rounded' height={420} sx={{ borderRadius: 4 }} />
    </Grid>
    <Grid size={{ xs: 12, xl: 4 }}>
      <Skeleton variant='rounded' height={420} sx={{ borderRadius: 4 }} />
    </Grid>
    <Grid size={12}>
      <Skeleton variant='rounded' height={420} sx={{ borderRadius: 4 }} />
    </Grid>
  </Grid>
);

const TermStatisticsPage = () => {
  const [termStartDate, setTermStartDate] = useState<Date | null>(getStartOfMonth());
  const [termEndDate, setTermEndDate] = useState<Date | null>(getEndOfMonth());
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');

  const { data: departments = [] } = useDepartments();
  const { data: programs = [] } = usePrograms();

  const filteredPrograms = useMemo(() => {
    if (departmentFilter === 'all') {
      return programs;
    }

    return programs.filter((program) => program.departmentId === departmentFilter);
  }, [departmentFilter, programs]);

  useEffect(() => {
    if (programFilter === 'all') {
      return;
    }

    const isProgramAvailable = filteredPrograms.some((program) => program.id === programFilter);

    if (!isProgramAvailable) {
      setProgramFilter('all');
    }
  }, [filteredPrograms, programFilter]);

  const queryParams = useMemo(
    () => ({
      startDate: termStartDate ? formatDateForAPI(termStartDate) : '',
      endDate: termEndDate ? formatDateForAPI(termEndDate) : '',
      departmentId: departmentFilter,
      programId: programFilter,
    }),
    [departmentFilter, programFilter, termEndDate, termStartDate]
  );

  const {
    data: statistics,
    error,
    isLoading,
    isFetching,
  } = useTermStatistics(queryParams);

  const hasChartData = (statistics?.dailyBreakdown.length ?? 0) > 0;
  const bestAndWorstDay = useMemo(
    () => findBestAndWorstDay(statistics?.dailyBreakdown ?? []),
    [statistics?.dailyBreakdown]
  );

  const scopeChips = useMemo(() => {
    if (!statistics) {
      return [];
    }

    return [
      statistics.summary.scope.departmentName
        ? `แผนก ${statistics.summary.scope.departmentName}`
        : 'ทุกแผนก',
      statistics.summary.scope.programName ? `สาขา ${statistics.summary.scope.programName}` : 'ทุกสาขา',
      `นักเรียน ${statistics.summary.scope.totalStudents.toLocaleString()} คน`,
      `ครู ${statistics.summary.scope.totalTeachers.toLocaleString()} คน`,
    ];
  }, [statistics]);

  const handleExportExcel = () => {
    if (!statistics || !termStartDate || !termEndDate) {
      return;
    }

    const workbook = XLSX.utils.book_new();
    const { summary, studentCheckInStats, teacherUsageStats, dailyBreakdown } = statistics;

    const summarySheetData = [
      ['สถิติการใช้งานระบบตามเทอม'],
      [`ข้อมูลตั้งแต่ ${formatThaiDate(termStartDate)} ถึง ${formatThaiDate(termEndDate)}`],
      [`แผนก: ${summary.scope.departmentName ?? 'ทุกแผนก'}`],
      [`สาขา: ${summary.scope.programName ?? 'ทุกสาขา'}`],
      [],
      ['ภาพรวม'],
      ['นักเรียนในขอบเขต', summary.scope.totalStudents],
      ['ครูในขอบเขต', summary.scope.totalTeachers],
      ['จำนวนวันที่มีการเช็คชื่อ', studentCheckInStats.totalCheckInDays],
      ['จำนวนรายการที่ถูกเช็คชื่อ', studentCheckInStats.checkedRecords],
      ['อัตราเข้าแถวเฉลี่ย', `${studentCheckInStats.averageAttendanceRate.toFixed(2)}%`],
      ['มาเข้าแถว', studentCheckInStats.studentsCheckedIn, `${studentCheckInStats.checkInPercentage.toFixed(2)}%`],
      ['ไม่มาตามปกติ', studentCheckInStats.studentsNotCheckedIn, `${studentCheckInStats.notCheckedInPercentage.toFixed(2)}%`],
      [],
      ['แยกตามสถานะ'],
      ['มาเข้าแถว', studentCheckInStats.totals.present],
      ['ขาด', studentCheckInStats.totals.absent],
      ['สาย', studentCheckInStats.totals.late],
      ['ลา', studentCheckInStats.totals.leave],
      ['ฝึกงาน', studentCheckInStats.totals.internship],
      [],
      ['การใช้งานครู'],
      ['ครูทั้งหมด', teacherUsageStats.totalTeachers],
      ['ครูที่ใช้งาน', teacherUsageStats.activeTeachers, `${teacherUsageStats.activePercentage.toFixed(2)}%`],
      ['ครูที่ยังไม่ใช้งาน', teacherUsageStats.inactiveTeachers, `${teacherUsageStats.inactivePercentage.toFixed(2)}%`],
    ];

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summarySheetData), 'ภาพรวม');

    const dailySheetData = [
      ['วันที่', 'มาเข้าแถว', 'ขาด', 'สาย', 'ลา', 'ฝึกงาน', 'เช็คชื่อรวม', 'นักเรียนในขอบเขต', 'อัตราเข้าแถว (%)'],
      ...dailyBreakdown.map((row) => [
        formatThaiDate(new Date(row.date)),
        row.present,
        row.absent,
        row.late,
        row.leave,
        row.internship,
        row.checkedRecords,
        row.totalStudents,
        row.attendanceRate.toFixed(2),
      ]),
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(dailySheetData), 'สถิติรายวัน');

    const teacherSheetData = [
      ['รหัสครู', 'ชื่อครู', 'แผนก', 'สาขา', 'จำนวนครั้งที่เช็คชื่อ', 'เช็คชื่อล่าสุด', 'สถานะ'],
      ...teacherUsageStats.teacherActivityDetails.map((teacher) => [
        teacher.teacherId,
        teacher.teacherName,
        teacher.department ?? '-',
        teacher.program ?? '-',
        teacher.checkInCount,
        teacher.lastCheckInDate ? formatThaiDateTime(teacher.lastCheckInDate) : '-',
        teacher.isActive ? 'มีการใช้งาน' : 'ยังไม่ใช้งาน',
      ]),
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(teacherSheetData), 'สถิติครู');

    XLSX.writeFile(
      workbook,
      `สถิติการใช้งานระบบ_${formatDateForAPI(termStartDate)}_${formatDateForAPI(termEndDate)}.xlsx`
    );
  };

  if (isLoading && !statistics) {
    return <StatisticsSkeleton />;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <HeroCard>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Stack spacing={2.2}>
                  <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                    <Avatar
                      sx={{
                        width: { xs: 58, md: 66 },
                        height: { xs: 58, md: 66 },
                        bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                        color: 'primary.main',
                      }}
                    >
                      <MdAssessment size={26} />
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <HeroEyebrow>Term Analytics</HeroEyebrow>
                      <Typography
                        sx={{
                          mt: 0.9,
                          fontSize: 'clamp(1.75rem, 1.45rem + 1vw, 2.8rem)',
                          fontWeight: 800,
                          letterSpacing: '-0.05em',
                          lineHeight: 1.05,
                        }}
                      >
                        สถิติการใช้งานระบบตามเทอม
                      </Typography>
                      <Typography
                        sx={{
                          mt: 1,
                          maxWidth: 680,
                          fontSize: '1rem',
                          lineHeight: 1.7,
                          color: 'text.secondary',
                        }}
                      >
                        ใช้ดูภาพรวมการเข้าแถวของนักเรียน การใช้งานครู และจุดที่ควรติดตามในช่วงวันที่เลือก
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                    {scopeChips.map((chip) => (
                      <Chip
                        key={chip}
                        label={chip}
                        size='small'
                        sx={{
                          borderRadius: 999,
                          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                          color: 'text.primary',
                          fontWeight: 700,
                        }}
                      />
                    ))}
                    {isFetching ? (
                      <Chip
                        label='กำลังอัปเดตข้อมูล'
                        size='small'
                        sx={{
                          borderRadius: 999,
                          bgcolor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                          color: 'warning.main',
                          fontWeight: 700,
                        }}
                      />
                    ) : null}
                  </Stack>

                  {statistics ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, minmax(0, 1fr))' },
                        gap: 1.25,
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 2.5,
                          p: 1.55,
                          borderTop: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.38)}`,
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                        }}
                      >
                        <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          นักเรียน
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: '1.35rem' }}>
                          {statistics.summary.scope.totalStudents.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          borderRadius: 2.5,
                          p: 1.55,
                          borderTop: (theme) => `2px solid ${alpha(theme.palette.success.main, 0.38)}`,
                          backgroundColor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                        }}
                      >
                        <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          อัตราเข้าแถว
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: '1.35rem' }}>
                          {statistics.studentCheckInStats.averageAttendanceRate.toFixed(2)}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          borderRadius: 2.5,
                          p: 1.55,
                          borderTop: (theme) => `2px solid ${alpha(theme.palette.info.main, 0.38)}`,
                          backgroundColor: (theme) => alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                        }}
                      >
                        <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          ครูที่ใช้งาน
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: '1.35rem' }}>
                          {statistics.teacherUsageStats.activeTeachers.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          borderRadius: 2.5,
                          p: 1.55,
                          borderTop: (theme) => `2px solid ${alpha(theme.palette.warning.main, 0.38)}`,
                          backgroundColor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                        }}
                      >
                        <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          วันเช็คชื่อ
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: '1.35rem' }}>
                          {statistics.studentCheckInStats.totalCheckInDays.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <FilterSurface>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <SectionHeading>ช่วงข้อมูลและตัวกรอง</SectionHeading>
                        <Typography sx={{ mt: 0.9, color: 'text.secondary', lineHeight: 1.7 }}>
                          ปรับช่วงเวลา แผนก และสาขาเพื่อดูเทรนด์จริงของภาคเรียนหรือช่วงที่ต้องการ
                        </Typography>
                      </Box>

                      <Button
                        variant='contained'
                        startIcon={<FaFileExcel />}
                        onClick={handleExportExcel}
                        disabled={!statistics}
                        sx={{
                          alignSelf: 'flex-start',
                          minWidth: { xs: 48, sm: 148 },
                          borderRadius: 2.5,
                          px: { xs: 1.4, sm: 2.2 },
                          boxShadow: (theme) => `0 18px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          Export Excel
                        </Box>
                      </Button>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <ThaiDatePicker
                          label='วันที่เริ่มต้น'
                          value={termStartDate}
                          onChange={setTermStartDate}
                          format='dd/MM/yyyy'
                          placeholder='วัน เดือน ปี'
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <ThaiDatePicker
                          label='วันที่สิ้นสุด'
                          value={termEndDate}
                          onChange={setTermEndDate}
                          format='dd/MM/yyyy'
                          placeholder='วัน เดือน ปี'
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label='แผนก'
                          value={departmentFilter}
                          onChange={(event) => setDepartmentFilter(event.target.value)}
                          sx={CONTROL_SX}
                        >
                          <MenuItem value='all'>ทุกแผนก</MenuItem>
                          {departments.map((department) => (
                            <MenuItem key={department.id} value={department.id}>
                              {department.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label='สาขา'
                          value={programFilter}
                          onChange={(event) => setProgramFilter(event.target.value)}
                          sx={CONTROL_SX}
                        >
                          <MenuItem value='all'>ทุกสาขา</MenuItem>
                          {filteredPrograms.map((program) => (
                            <MenuItem key={program.id} value={program.id}>
                              {program.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Stack>
                </FilterSurface>
              </Grid>
            </Grid>
          </CardContent>
        </HeroCard>
      </Grid>

      {error ? (
        <Grid size={12}>
          <Alert severity='error'>{getErrorMessage(error)}</Alert>
        </Grid>
      ) : null}

      {statistics ? (
        <>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatisticsCard
              title='นักเรียนในขอบเขต'
              value={statistics.summary.scope.totalStudents.toLocaleString()}
              caption='นับจากตัวกรองแผนกและสาขาปัจจุบัน'
              insight={`เช็คชื่อแล้ว ${statistics.studentCheckInStats.checkedRecords.toLocaleString()} รายการ`}
              icon={<FaUserGraduate />}
              tone='primary'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatisticsCard
              title='อัตราเข้าแถวเฉลี่ย'
              value={`${statistics.studentCheckInStats.averageAttendanceRate.toFixed(2)}%`}
              caption='คำนวณจาก มาเข้าแถว ÷ จำนวนที่เช็คชื่อจริง'
              insight={`ไม่มาตามปกติ ${statistics.studentCheckInStats.studentsNotCheckedIn.toLocaleString()} รายการ`}
              icon={<FaChartLine />}
              tone='success'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatisticsCard
              title='ครูที่ใช้งาน'
              value={statistics.teacherUsageStats.activeTeachers.toLocaleString()}
              caption={`จากครูทั้งหมด ${statistics.teacherUsageStats.totalTeachers.toLocaleString()} คน`}
              insight={`อัตราใช้งาน ${statistics.teacherUsageStats.activePercentage.toFixed(2)}%`}
              icon={<FaChalkboardTeacher />}
              tone='info'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatisticsCard
              title='วันที่มีการเช็คชื่อ'
              value={statistics.studentCheckInStats.totalCheckInDays.toLocaleString()}
              caption='ใช้วัดความต่อเนื่องของการรายงานประจำวัน'
              insight={
                bestAndWorstDay.bestDay
                  ? `สูงสุด ${bestAndWorstDay.bestDay.attendanceRate.toFixed(2)}%`
                  : 'ยังไม่มีข้อมูลรายวัน'
              }
              icon={<MdAssessment />}
              tone='warning'
            />
          </Grid>

          <Grid size={12}>
            <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
              {bestAndWorstDay.bestDay ? (
                <Chip
                  label={`ดีที่สุด ${formatThaiDate(new Date(bestAndWorstDay.bestDay.date))} · ${bestAndWorstDay.bestDay.attendanceRate.toFixed(2)}%`}
                  sx={{
                    borderRadius: 999,
                    bgcolor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
                    color: 'success.main',
                    fontWeight: 700,
                  }}
                />
              ) : null}
              {bestAndWorstDay.worstDay ? (
                <Chip
                  label={`น่าติดตาม ${formatThaiDate(new Date(bestAndWorstDay.worstDay.date))} · ${bestAndWorstDay.worstDay.attendanceRate.toFixed(2)}%`}
                  sx={{
                    borderRadius: 999,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
                    color: 'warning.main',
                    fontWeight: 700,
                  }}
                />
              ) : null}
              {statistics.teacherUsageStats.teacherActivityDetails.length > 0 ? (
                <Chip
                  label={`ครูใช้งานล่าสุด ${statistics.teacherUsageStats.teacherActivityDetails.find((teacher) => teacher.isActive)?.teacherName ?? '-'}`}
                  sx={{
                    borderRadius: 999,
                    bgcolor: (theme) => alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
                    color: 'info.main',
                    fontWeight: 700,
                  }}
                />
              ) : null}
            </Stack>
          </Grid>

          {hasChartData ? (
            <>
              <Grid size={{ xs: 12, xl: 8 }} sx={{ minWidth: 0 }}>
                <ChartSurface>
                  <CardContent sx={{ p: { xs: 2.25, md: 2.75 }, height: '100%' }}>
                    <DailyAttendanceChart dailyData={statistics.dailyChartData} />
                  </CardContent>
                </ChartSurface>
              </Grid>

              <Grid size={{ xs: 12, xl: 4 }} sx={{ minWidth: 0 }}>
                <Stack spacing={3} sx={{ height: '100%' }}>
                  <ChartSurface sx={{ flex: 1 }}>
                    <CardContent sx={{ p: { xs: 2.25, md: 2.5 }, height: '100%' }}>
                      <AttendanceChart
                        studentsCheckedIn={statistics.studentCheckInStats.studentsCheckedIn}
                        studentsNotCheckedIn={statistics.studentCheckInStats.studentsNotCheckedIn}
                        averageAttendanceRate={statistics.studentCheckInStats.averageAttendanceRate}
                      />
                    </CardContent>
                  </ChartSurface>

                  <ChartSurface sx={{ flex: 1 }}>
                    <CardContent sx={{ p: { xs: 2.25, md: 2.5 }, height: '100%' }}>
                      <TeacherUsageChart
                        activeTeachers={statistics.teacherUsageStats.activeTeachers}
                        inactiveTeachers={statistics.teacherUsageStats.inactiveTeachers}
                      />
                    </CardContent>
                  </ChartSurface>
                </Stack>
              </Grid>

              <Grid size={12}>
                <DailyBreakdownTable dailyData={statistics.dailyBreakdown} />
              </Grid>
            </>
          ) : (
            <Grid size={12}>
              <EmptyStateCard>
                <CardContent sx={{ py: { xs: 5, md: 6 }, textAlign: 'center' }}>
                  <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                    ยังไม่มีข้อมูลการเช็คชื่อในช่วงวันที่นี้
                  </Typography>
                  <Typography sx={{ mt: 1.25, maxWidth: 560, mx: 'auto', color: 'text.secondary', lineHeight: 1.7 }}>
                    ระบบยังคงแสดงขอบเขตของนักเรียนและครูให้ แต่จะไม่มีกราฟและตารางรายวันจนกว่าจะมีการบันทึกเช็คชื่อหน้าธง
                  </Typography>
                </CardContent>
              </EmptyStateCard>
            </Grid>
          )}

          <Grid size={12}>
            <TeacherActivityTable teachers={statistics.teacherUsageStats.teacherActivityDetails} />
          </Grid>
        </>
      ) : null}
    </Grid>
  );
};

export default TermStatisticsPage;
