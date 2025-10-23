'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { FaChartPie, FaUserGraduate, FaChalkboardTeacher, FaFileExcel } from 'react-icons/fa';
import { MdAssessment } from 'react-icons/md';
import * as XLSX from 'xlsx';

import { useTermStatistics, useDepartments, usePrograms } from '@/hooks/queries';
import StatisticsCard from './components/StatisticsCard';
import AttendanceChart from './components/AttendanceChart';
import TeacherUsageChart from './components/TeacherUsageChart';
import DailyAttendanceChart from './components/DailyAttendanceChart';
import DailyBreakdownTable from './components/DailyBreakdownTable';
import TeacherActivityTable from './components/TeacherActivityTable';
import {
  formatDateForAPI,
  formatThaiDate,
  getEndOfMonth,
  getStartOfMonth,
} from '@/@core/components/mui/date-picker-thai/utils';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

const TermStatisticsPage = () => {
  const [termStartDate, setTermStartDate] = useState<Date | null>(getStartOfMonth());
  const [termEndDate, setTermEndDate] = useState<Date | null>(getEndOfMonth());
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState(0);

  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(
    () => ({
      startDate: termStartDate ? formatDateForAPI(termStartDate) : '',
      endDate: termEndDate ? formatDateForAPI(termEndDate) : '',
      departmentId: departmentFilter,
      programId: programFilter,
    }),
    [termStartDate, termEndDate, departmentFilter, programFilter]
  );

  // Fetch statistics with React Query
  const {
    data: statistics,
    isLoading: isLoadingData,
    error: statisticsError,
  } = useTermStatistics(queryParams);

  // Fetch departments and programs
  const { data: departments = [] } = useDepartments();
  const { data: programs = [] } = usePrograms();

  // Convert error to string
  const error = statisticsError ? 'เกิดข้อผิดพลาดในการโหลดข้อมูล' : null;

  const handleExportExcel = () => {
    if (!statistics || !termStartDate || !termEndDate) return;

    const workbook = XLSX.utils.book_new();

    // Sheet 1: ภาพรวม
    const overviewData = [
      ['สถิติการใช้งานระบบตามเทอม'],
      [`ข้อมูลตั้งแต่ ${formatThaiDate(termStartDate)} ถึง ${formatThaiDate(termEndDate)}`],
      [],
      ['ภาพรวม'],
      ['นักเรียนทั้งหมด', statistics.studentCheckInStats.totalStudents],
      ['อัตราเข้าเรียนเฉลี่ย', `${statistics.studentCheckInStats.averageAttendanceRate.toFixed(2)}%`],
      ['จำนวนวันที่เช็คชื่อ', statistics.studentCheckInStats.totalCheckInDays],
      [],
      ['สถิติการมาเข้าแถว'],
      [
        'มาเข้าแถว',
        statistics.studentCheckInStats.studentsCheckedIn,
        `${statistics.studentCheckInStats.checkInPercentage.toFixed(2)}%`,
      ],
      [
        'ไม่มาเข้าแถว',
        statistics.studentCheckInStats.studentsNotCheckedIn,
        `${statistics.studentCheckInStats.notCheckedInPercentage.toFixed(2)}%`,
      ],
    ];

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'ภาพรวม');

    // Sheet 2: สถิติการเข้าแถวรายวัน
    if (statistics.dailyBreakdown && statistics.dailyBreakdown.length > 0) {
      const dailyData = [
        ['สถิติการเข้าแถวรายวัน'],
        [],
        ['วันที่', 'มาเข้าแถว', 'ไม่มาเข้าแถว', 'รวม', 'อัตราการเข้าแถว (%)'],
      ];

      statistics.dailyBreakdown.forEach((day: any) => {
        const checkedIn = day.checkedIn ?? 0;
        const notCheckedIn = day.notCheckedIn ?? 0;
        const totalStudents = day.totalStudents ?? 0;
        // คำนวณอัตราการเข้าเรียนจากข้อมูลจริงที่เช็คชื่อในวันนั้น
        const actualCheckedStudents = checkedIn + notCheckedIn;
        const attendanceRate = actualCheckedStudents > 0 ? (checkedIn / actualCheckedStudents) * 100 : 0;

        dailyData.push([
          formatThaiDate(new Date(day.date)),
          checkedIn,
          notCheckedIn,
          actualCheckedStudents,
          attendanceRate.toFixed(2),
        ]);
      });

      const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
      XLSX.utils.book_append_sheet(workbook, dailySheet, 'สถิติรายวัน');
    }

    // Sheet 3: สถิติการใช้งานของครู
    const teacherOverviewData = [
      ['สถิติการใช้งานของครู'],
      [],
      ['ครูทั้งหมด', statistics.teacherUsageStats.totalTeachers],
      [
        'ครูที่ใช้งาน',
        statistics.teacherUsageStats.activeTeachers,
        `${statistics.teacherUsageStats.activePercentage.toFixed(2)}%`,
      ],
      [
        'ครูที่ไม่ได้ใช้งาน',
        statistics.teacherUsageStats.inactiveTeachers,
        `${statistics.teacherUsageStats.inactivePercentage.toFixed(2)}%`,
      ],
      [],
      ['รายละเอียดการใช้งานของครู'],
      ['รหัสครู', 'ชื่อ-นามสกุล', 'แผนก', 'สาขาวิชา', 'จำนวนครั้งที่เช็คชื่อ', 'เช็คชื่อล่าสุด', 'สถานะการใช้งาน'],
    ];

    if (
      statistics.teacherUsageStats.teacherActivityDetails &&
      statistics.teacherUsageStats.teacherActivityDetails.length > 0
    ) {
      statistics.teacherUsageStats.teacherActivityDetails.forEach((teacher: any) => {
        const lastCheckInDate = teacher.lastCheckInDate ? formatThaiDate(new Date(teacher.lastCheckInDate)) : '-';

        teacherOverviewData.push([
          teacher.teacherId || '-',
          teacher.teacherName || '-',
          teacher.department || '-',
          teacher.program || '-',
          teacher.checkInCount || 0,
          lastCheckInDate,
          teacher.isActive ? 'ใช้งาน' : 'ไม่ได้ใช้งาน',
        ]);
      });
    }

    const teacherSheet = XLSX.utils.aoa_to_sheet(teacherOverviewData);
    XLSX.utils.book_append_sheet(workbook, teacherSheet, 'สถิติครู');

    // Export file
    const fileName = `สถิติการใช้งานระบบ_${formatDateForAPI(termStartDate)}_${formatDateForAPI(termEndDate)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Grid container spacing={6}>
      {/* Header Card */}
      <Grid size={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'second.main' }}>
                <MdAssessment />
              </Avatar>
            }
            title='สถิติการใช้งานระบบตามเทอม'
            subheader={
              termStartDate && termEndDate
                ? `ข้อมูลตั้งแต่ ${formatThaiDate(termStartDate)} ถึง ${formatThaiDate(termEndDate)}`
                : 'เลือกช่วงวันที่'
            }
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
                {isLoadingData && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant='caption' color='text.secondary'>
                      กำลังโหลด...
                    </Typography>
                  </Box>
                )}
                {statistics && (
                  <Button
                    variant='contained'
                    color='success'
                    startIcon={<FaFileExcel />}
                    onClick={handleExportExcel}
                    sx={{
                      minWidth: { xs: 'auto', sm: 120 },
                      px: { xs: 2, sm: 3 },
                    }}
                  >
                    <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>
                      Export
                    </Box>
                    <Box component='span' sx={{ display: { xs: 'inline', sm: 'none' } }}>
                      Excel
                    </Box>
                  </Button>
                )}
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ThaiDatePicker
                  label='วันที่เริ่มต้น'
                  value={termStartDate}
                  onChange={(newValue: Date | null) => setTermStartDate(newValue)}
                  format='dd/MM/yyyy'
                  placeholder='วัน/เดือน/ปี (พ.ศ.)'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ThaiDatePicker
                  label='วันที่สิ้นสุด'
                  value={termEndDate}
                  onChange={(newValue: Date | null) => setTermEndDate(newValue)}
                  format='dd/MM/yyyy'
                  placeholder='วัน/เดือน/ปี (พ.ศ.)'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>แผนก</InputLabel>
                  <Select value={departmentFilter} label='แผนก' onChange={(e) => setDepartmentFilter(e.target.value)}>
                    <MenuItem value='all'>ทั้งหมด</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>สาขาวิชา</InputLabel>
                  <Select value={programFilter} label='สาขาวิชา' onChange={(e) => setProgramFilter(e.target.value)}>
                    <MenuItem value='all'>ทั้งหมด</MenuItem>
                    {programs.map((prog) => (
                      <MenuItem key={prog.id} value={prog.id}>
                        {prog.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {error && (
        <Grid size={12}>
          <Alert severity='error'>{error}</Alert>
        </Grid>
      )}

      {!statistics && !error && (
        <Grid size={12}>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
            <CircularProgress />
          </Box>
        </Grid>
      )}

      {isLoadingData && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(2px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box textAlign='center'>
            <CircularProgress size={48} />
            <Typography variant='body1' sx={{ mt: 2, fontWeight: 500 }}>
              กำลังโหลดข้อมูล...
            </Typography>
          </Box>
        </Box>
      )}

      {statistics && (
        <>
          {/* Tab Navigation */}
          <Grid size={12}>
            <Paper sx={{ width: '100%', mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_e, newValue) => setActiveTab(newValue)}
                indicatorColor='primary'
                textColor='primary'
                variant='scrollable'
                scrollButtons='auto'
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTab-root': {
                    minWidth: { xs: 100, sm: 120, md: 'auto' },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    px: { xs: 1, sm: 2 },
                  },
                }}
              >
                <Tab label='ภาพรวม' />
                <Tab label='สถิติการเข้าแถวของนักเรียน' />
                <Tab label='สถิติการใช้งานของครู' />
              </Tabs>
            </Paper>
          </Grid>

          {/* Tab Panels */}
          {activeTab === 0 && (
            <>
              {/* Summary Overview Card */}
              <Grid size={12}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box textAlign='center'>
                          <Typography variant='h3' fontWeight='bold'>
                            {statistics.studentCheckInStats.totalStudents.toLocaleString()}
                          </Typography>
                          <Typography variant='body1' sx={{ opacity: 0.9 }}>
                            นักเรียนทั้งหมด
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box textAlign='center'>
                          <Typography variant='h3' fontWeight='bold'>
                            {statistics.studentCheckInStats.averageAttendanceRate.toFixed(2)}%
                          </Typography>
                          <Typography variant='body1' sx={{ opacity: 0.9 }}>
                            อัตราเข้าเรียนเฉลี่ย
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box textAlign='center'>
                          <Typography variant='h3' fontWeight='bold'>
                            {statistics.studentCheckInStats.totalCheckInDays}
                          </Typography>
                          <Typography variant='body1' sx={{ opacity: 0.9 }}>
                            จำนวนวันที่เช็คชื่อ
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Charts Section */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ height: '100%', minHeight: { xs: 350, sm: 400 } }}>
                  <CardContent sx={{ height: '100%' }}>
                    <AttendanceChart
                      studentsCheckedIn={statistics.studentCheckInStats.studentsCheckedIn}
                      studentsNotCheckedIn={statistics.studentCheckInStats.studentsNotCheckedIn}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ height: '100%', minHeight: { xs: 350, sm: 400 } }}>
                  <CardContent sx={{ height: '100%', pb: 1 }}>
                    <DailyAttendanceChart dailyData={statistics.dailyChartData} />
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <>
              {/* Student Check-In Statistics */}
              <Grid size={12}>
                <Typography variant='h5' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaUserGraduate />
                  สถิติการมาเข้าแถวของนักเรียน
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatisticsCard
                  title='นักเรียนทั้งหมด'
                  value={statistics.studentCheckInStats.totalStudents}
                  icon={<FaUserGraduate />}
                  color='primary'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatisticsCard
                  title='มาเข้าแถว'
                  value={statistics.studentCheckInStats.studentsCheckedIn}
                  subtitle={`${statistics.studentCheckInStats.checkInPercentage.toFixed(2)}%`}
                  icon={<FaUserGraduate />}
                  color='success'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatisticsCard
                  title='ไม่มาเข้าแถว'
                  value={statistics.studentCheckInStats.studentsNotCheckedIn}
                  subtitle={`${statistics.studentCheckInStats.notCheckedInPercentage.toFixed(2)}%`}
                  icon={<FaUserGraduate />}
                  color='error'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatisticsCard
                  title='จำนวนวันเช็คชื่อ'
                  value={statistics.studentCheckInStats.totalCheckInDays}
                  subtitle={`เฉลี่ย ${statistics.studentCheckInStats.averageAttendanceRate.toFixed(2)}%`}
                  icon={<FaChartPie />}
                  color='info'
                />
              </Grid>

              {/* Daily Breakdown Table */}
              <Grid size={12}>
                <DailyBreakdownTable dailyData={statistics.dailyBreakdown} />
              </Grid>
            </>
          )}

          {activeTab === 2 && (
            <>
              {/* Teacher Usage Statistics */}
              <Grid size={12}>
                <Typography variant='h5' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaChalkboardTeacher />
                  สถิติการใช้งานของครู
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatisticsCard
                  title='ครูทั้งหมด'
                  value={statistics.teacherUsageStats.totalTeachers}
                  icon={<FaChalkboardTeacher />}
                  color='primary'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatisticsCard
                  title='ครูที่ใช้งาน'
                  value={statistics.teacherUsageStats.activeTeachers}
                  subtitle={`${statistics.teacherUsageStats.activePercentage.toFixed(2)}%`}
                  icon={<FaChalkboardTeacher />}
                  color='success'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatisticsCard
                  title='ครูที่ไม่ได้ใช้งาน'
                  value={statistics.teacherUsageStats.inactiveTeachers}
                  subtitle={`${statistics.teacherUsageStats.inactivePercentage.toFixed(2)}%`}
                  icon={<FaChalkboardTeacher />}
                  color='error'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatisticsCard
                  title='อัตราการใช้งานเฉลี่ย'
                  value={`${statistics.teacherUsageStats.activePercentage.toFixed(1)}%`}
                  icon={<FaChartPie />}
                  color='info'
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ minHeight: { xs: 350, sm: 400 } }}>
                  <CardContent>
                    <TeacherUsageChart
                      activeTeachers={statistics.teacherUsageStats.activeTeachers}
                      inactiveTeachers={statistics.teacherUsageStats.inactiveTeachers}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ minHeight: { xs: 350, sm: 400 } }}>
                  <CardHeader title='สรุปสถิติครู' />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'success.lighter' }}>
                          <Typography
                            variant='h4'
                            color='success.main'
                            align='center'
                            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                          >
                            {statistics.teacherUsageStats.activeTeachers}
                          </Typography>
                          <Typography
                            variant='body2'
                            align='center'
                            color='text.secondary'
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            ครูที่เข้าใช้งาน
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'error.lighter' }}>
                          <Typography
                            variant='h4'
                            color='error.main'
                            align='center'
                            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                          >
                            {statistics.teacherUsageStats.inactiveTeachers}
                          </Typography>
                          <Typography
                            variant='body2'
                            align='center'
                            color='text.secondary'
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            ครูที่ไม่ได้ใช้งาน
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Teacher Activity Table */}
              <Grid size={12}>
                <TeacherActivityTable teachers={statistics.teacherUsageStats.teacherActivityDetails} />
              </Grid>
            </>
          )}
        </>
      )}
    </Grid>
  );
};

export default TermStatisticsPage;
