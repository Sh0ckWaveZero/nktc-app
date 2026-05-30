'use client';

import { useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  HiOutlineClipboardList,
  HiOutlineDatabase,
  HiOutlineDocumentReport,
  HiOutlineUsers,
} from 'react-icons/hi';
import { MdManageAccounts, MdOutlineClass, MdOutlineHome } from 'react-icons/md';
import { TbChartBar, TbProgressCheck } from 'react-icons/tb';

import CustomAvatar from '@/@core/components/mui/avatar';
import IconifyIcon from '@/@core/components/icon';
import { formatDateForAPI, formatThaiDate, getStartOfMonth } from '@/@core/components/mui/date-picker-thai/utils';
import { apiConfig } from '@/configs/api';
import { useAuth } from '@/hooks/useAuth';
import { useTermStatistics } from '@/hooks/queries';
import { useAdminVisitSummaryReport } from '@/hooks/queries/useVisits';
import { AbilityContext } from '@/layouts/components/acl/Can';

import { buildAdminVisitOverview } from './admin-home.utils';

const WelcomeCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 20px 50px ${alpha(theme.palette.primary.main, 0.22)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 'auto -80px -120px auto',
    width: 280,
    height: 280,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    filter: 'blur(8px)',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.05)}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  justifyContent: 'flex-start',
  textAlign: 'left',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.96),
  color: theme.palette.text.primary,
  textTransform: 'none',
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.28),
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

interface AdminQuickAction {
  action: string;
  description: string;
  icon: string;
  id: string;
  path: string;
  subject: string;
  title: string;
}

const numberFormatter = new Intl.NumberFormat('th-TH');

const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getAdminVisitRecordedAt = (value: { latestRecordedAt?: string; visitDate: string }) => {
  return value.latestRecordedAt || value.visitDate;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === 'object' && error !== null) {
    const response =
      'response' in error ? (error as { response?: { data?: { message?: unknown } } }).response : undefined;

    if (typeof response?.data?.message === 'string') {
      return response.data.message;
    }

    const errorMessage = 'message' in error ? (error as { message?: unknown }).message : undefined;

    if (typeof errorMessage === 'string') {
      return errorMessage;
    }
  }

  return fallbackMessage;
};

const AdminHomePage = () => {
  const auth = useAuth();
  const ability = useContext(AbilityContext);
  const router = useRouter();
  const theme = useTheme();

  const startDate = useMemo(() => getStartOfMonth(), []);
  const endDate = useMemo(() => new Date(), []);

  const statisticsQueryParams = useMemo(
    () => ({
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
      academicYear: apiConfig.educationYears || undefined,
    }),
    [endDate, startDate],
  );

  const {
    data: statistics,
    error: statisticsError,
    isFetching: isFetchingStatistics,
    isLoading: isLoadingStatistics,
  } = useTermStatistics(statisticsQueryParams);

  const {
    data: visitRows = [],
    error: visitError,
    isFetching: isFetchingVisits,
    isLoading: isLoadingVisits,
  } = useAdminVisitSummaryReport({ academicYear: apiConfig.educationYears || undefined });

  const visitOverview = useMemo(
    () => buildAdminVisitOverview(visitRows, statistics?.teacherUsageStats.totalTeachers ?? 0),
    [statistics?.teacherUsageStats.totalTeachers, visitRows],
  );

  const teacherHighlights = useMemo(() => {
    return [...(statistics?.teacherUsageStats.teacherActivityDetails ?? [])]
      .sort((left, right) => {
        if (right.checkInCount !== left.checkInCount) {
          return right.checkInCount - left.checkInCount;
        }

        return (right.lastCheckInDate || '').localeCompare(left.lastCheckInDate || '');
      })
      .slice(0, 5);
  }, [statistics?.teacherUsageStats.teacherActivityDetails]);

  const dailyHighlights = useMemo(() => {
    const dailyBreakdown = statistics?.dailyBreakdown ?? [];

    if (dailyBreakdown.length === 0) {
      return {
        bestDay: null,
        latestDay: null,
        worstDay: null,
      };
    }

    const sortedByAttendance = [...dailyBreakdown].sort((left, right) => left.attendanceRate - right.attendanceRate);

    return {
      bestDay: sortedByAttendance[sortedByAttendance.length - 1] ?? null,
      latestDay: dailyBreakdown[dailyBreakdown.length - 1] ?? null,
      worstDay: sortedByAttendance[0] ?? null,
    };
  }, [statistics?.dailyBreakdown]);

  const recentVisitRows = useMemo(() => {
    return [...visitRows]
      .sort(
        (left, right) =>
          new Date(getAdminVisitRecordedAt(right)).getTime() - new Date(getAdminVisitRecordedAt(left)).getTime(),
      )
      .slice(0, 5);
  }, [visitRows]);

  const quickActions = useMemo<AdminQuickAction[]>(() => {
    const actions: AdminQuickAction[] = [
      {
        id: 'system-statistics',
        title: 'สถิติการใช้งานระบบ',
        description: 'ดูภาพรวมการเช็คชื่อและการใช้งานครูทั้งวิทยาลัย',
        path: '/apps/admin/reports/statistics',
        action: 'read',
        subject: 'admin-statistics-page',
        icon: 'carbon:analytics',
      },
      {
        id: 'check-in-daily',
        title: 'รายงานเสาธงรายวัน',
        description: 'ตรวจสอบข้อมูลเข้าแถวของทั้งวิทยาลัยรายวัน',
        path: '/apps/admin/reports/check-in/daily',
        action: 'read',
        subject: 'admin-report-check-in-page',
        icon: 'icon-park-twotone:flag',
      },
      {
        id: 'activity-daily',
        title: 'รายงานกิจกรรมรายวัน',
        description: 'ติดตามการเช็คชื่อกิจกรรมของผู้เรียน',
        path: '/apps/admin/reports/activity-check-in/daily',
        action: 'read',
        subject: 'admin-activity-check-in-page',
        icon: 'pepicons-pop:flag',
      },
      {
        id: 'visit-report',
        title: 'รายงานเยี่ยมบ้าน',
        description: 'ดูผลรวมการเยี่ยมบ้านของครูที่ปรึกษา',
        path: '/apps/admin/reports/visit',
        action: 'read',
        subject: 'admin-visit-report-page',
        icon: 'mdi:home-search-outline',
      },
      {
        id: 'classroom-settings',
        title: 'จัดการห้องเรียน',
        description: 'เพิ่ม แก้ไข เลื่อนชั้น และจบการศึกษา',
        path: '/apps/settings/classroom',
        action: 'read',
        subject: 'setting-system-page',
        icon: 'material-symbols:room-preferences-outline-rounded',
      },
      {
        id: 'student-list',
        title: 'ข้อมูลนักเรียน',
        description: 'ตรวจสอบรายชื่อนักเรียนและข้อมูลระเบียนทั้งหมด',
        path: '/apps/student/list',
        action: 'read',
        subject: 'student-page',
        icon: 'heroicons:academic-cap',
      },
      {
        id: 'teacher-list',
        title: 'ข้อมูลครูและบุคลากร',
        description: 'จัดการรายชื่อครู ผู้สอน และบุคลากรภายใน',
        path: '/apps/teacher/list',
        action: 'read',
        subject: 'teacher-page',
        icon: 'heroicons:user-group',
      },
    ];

    return actions.filter((item) => ability.can(item.action, item.subject));
  }, [ability]);

  const statisticsErrorMessage = statisticsError
    ? getErrorMessage(statisticsError, 'ไม่สามารถโหลดสถิติการใช้งานระบบได้')
    : null;
  const visitErrorMessage = visitError ? getErrorMessage(visitError, 'ไม่สามารถโหลดสรุปรายงานเยี่ยมบ้านได้') : null;

  const isLoadingDashboard = isLoadingStatistics && !statistics;

  if (isLoadingDashboard) {
    return (
      <Grid container spacing={4}>
        <Grid size={12}>
          <Skeleton variant='rounded' height={220} sx={{ borderRadius: 4 }} />
        </Grid>
        {[0, 1, 2, 3].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Skeleton variant='rounded' height={170} sx={{ borderRadius: 4 }} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Skeleton variant='rounded' height={360} sx={{ borderRadius: 4 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Skeleton variant='rounded' height={360} sx={{ borderRadius: 4 }} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant='h1' sx={{ display: 'none' }}>
        NKTC Student Management System - หน้าหลักแดชบอร์ดผู้ดูแลระบบ
      </Typography>

      <Grid container spacing={4}>
        <Grid size={12}>
          <WelcomeCard>
            <CardContent sx={{ p: { xs: 5, md: 7 }, position: 'relative', zIndex: 1 }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={3}
                  sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography variant='overline' sx={{ color: 'rgba(255, 255, 255, 0.72)', letterSpacing: 1.2 }}>
                      Administrator Dashboard
                    </Typography>
                    <Typography variant='h4' sx={{ fontWeight: 800, color: 'common.white', mt: 1, mb: 1.5 }}>
                      ศูนย์ควบคุมภาพรวมของวิทยาลัย
                    </Typography>
                    <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.84)', maxWidth: 760 }}>
                      สวัสดี {auth.user?.account?.firstName || 'ผู้ดูแลระบบ'} หน้านี้แสดงข้อมูลภาพรวมของทั้งวิทยาลัย
                      โดยแยกขาดจากแดชบอร์ดครูที่ปรึกษา และอิงข้อมูลจริงจากรายงานการเช็คชื่อและการใช้งานระบบ
                    </Typography>
                  </Box>

                  <Paper
                    sx={{
                      p: 3,
                      minWidth: { xs: '100%', md: 300 },
                      borderRadius: 3,
                      color: 'common.white',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        ช่วงข้อมูลที่กำลังแสดง
                      </Typography>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        {formatThaiDate(startDate)} - {formatThaiDate(endDate)}
                      </Typography>
                      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.18)' }} />
                      <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                        <Chip
                          label={apiConfig.educationYears ? `ปีการศึกษา ${apiConfig.educationYears}` : 'เดือนปัจจุบัน'}
                          size='small'
                          sx={{
                            color: 'common.white',
                            backgroundColor: 'rgba(255, 255, 255, 0.14)',
                            '& .MuiChip-label': { px: 1.5 },
                          }}
                        />
                        {isFetchingStatistics || isFetchingVisits ? (
                          <Chip
                            label='กำลังอัปเดตข้อมูล'
                            size='small'
                            sx={{
                              color: 'common.white',
                              backgroundColor: 'rgba(255, 255, 255, 0.14)',
                            }}
                          />
                        ) : null}
                      </Stack>
                    </Stack>
                  </Paper>
                </Stack>
              </Stack>
            </CardContent>
          </WelcomeCard>
        </Grid>

        {statisticsErrorMessage ? (
          <Grid size={12}>
            <Alert severity='error' variant='outlined'>
              {statisticsErrorMessage}
            </Alert>
          </Grid>
        ) : null}

        {visitErrorMessage ? (
          <Grid size={12}>
            <Alert severity='warning' variant='outlined'>
              {visitErrorMessage}
            </Alert>
          </Grid>
        ) : null}

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      นักเรียนในขอบเขต
                    </Typography>
                    <Typography variant='h4' sx={{ mt: 1, fontWeight: 800, color: 'primary.main' }}>
                      {numberFormatter.format(statistics?.summary.scope.totalStudents ?? 0)}
                    </Typography>
                  </Box>
                  <CustomAvatar skin='light' color='primary' sx={{ width: 48, height: 48 }}>
                    <HiOutlineDatabase style={{ fontSize: '1.4rem' }} />
                  </CustomAvatar>
                </Box>

                <Stack spacing={0.75}>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    เช็คชื่อแล้ว {numberFormatter.format(statistics?.studentCheckInStats.checkedRecords ?? 0)} รายการ
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    วันที่มีข้อมูล {numberFormatter.format(statistics?.studentCheckInStats.totalCheckInDays ?? 0)} วัน
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      อัตราเข้าแถวเฉลี่ย
                    </Typography>
                    <Typography variant='h4' sx={{ mt: 1, fontWeight: 800, color: 'success.main' }}>
                      {(statistics?.studentCheckInStats.averageAttendanceRate ?? 0).toFixed(2)}%
                    </Typography>
                  </Box>
                  <CustomAvatar skin='light' color='success' sx={{ width: 48, height: 48 }}>
                    <TbProgressCheck style={{ fontSize: '1.4rem' }} />
                  </CustomAvatar>
                </Box>

                <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  <Chip label={`มา ${numberFormatter.format(statistics?.studentCheckInStats.totals.present ?? 0)}`} size='small' color='success' variant='outlined' />
                  <Chip label={`สาย ${numberFormatter.format(statistics?.studentCheckInStats.totals.late ?? 0)}`} size='small' color='warning' variant='outlined' />
                  <Chip label={`ลา ${numberFormatter.format(statistics?.studentCheckInStats.totals.leave ?? 0)}`} size='small' color='info' variant='outlined' />
                  <Chip label={`ขาด ${numberFormatter.format(statistics?.studentCheckInStats.totals.absent ?? 0)}`} size='small' color='error' variant='outlined' />
                </Stack>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      ครูที่ใช้งานเช็คชื่อ
                    </Typography>
                    <Typography variant='h4' sx={{ mt: 1, fontWeight: 800, color: 'secondary.main' }}>
                      {numberFormatter.format(statistics?.teacherUsageStats.activeTeachers ?? 0)} /
                      {' '}
                      {numberFormatter.format(statistics?.teacherUsageStats.totalTeachers ?? 0)}
                    </Typography>
                  </Box>
                  <CustomAvatar skin='light' color='secondary' sx={{ width: 48, height: 48 }}>
                    <HiOutlineUsers style={{ fontSize: '1.4rem' }} />
                  </CustomAvatar>
                </Box>

                <Box>
                  <LinearProgress
                    variant='determinate'
                    value={statistics?.teacherUsageStats.activePercentage ?? 0}
                    color='secondary'
                    sx={{ height: 8, borderRadius: 999, mb: 1.25 }}
                  />
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    คิดเป็น {(statistics?.teacherUsageStats.activePercentage ?? 0).toFixed(2)}% ของครูทั้งหมด
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      ครูที่มีรายงานเยี่ยมบ้าน
                    </Typography>
                    <Typography variant='h4' sx={{ mt: 1, fontWeight: 800, color: 'info.main' }}>
                      {numberFormatter.format(visitOverview.uniqueTeachers)} คน
                    </Typography>
                  </Box>
                  <CustomAvatar skin='light' color='info' sx={{ width: 48, height: 48 }}>
                    <MdOutlineHome style={{ fontSize: '1.4rem' }} />
                  </CustomAvatar>
                </Box>

                <Box>
                  <LinearProgress
                    variant='determinate'
                    value={visitOverview.teacherCoverageRate}
                    color='info'
                    sx={{ height: 8, borderRadius: 999, mb: 1.25 }}
                  />
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    ครอบคลุมนักเรียน {numberFormatter.format(visitOverview.totalStudentPopulation)} คน จาก scope ครูที่ปรึกษา
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    รายงานล่าสุด {formatDisplayDate(visitOverview.latestRecordedAt)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>
                    ทางลัดสำหรับผู้ดูแลระบบ
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    ลิงก์ทั้งหมดในส่วนนี้อิงจากสิทธิ์ของ admin โดยตรง และไม่ปะปนกับ flow ของครูที่ปรึกษา
                  </Typography>
                </Box>
                <Button
                  id='admin-home-open-statistics-button'
                  variant='outlined'
                  endIcon={<IconifyIcon icon='carbon:analytics' />}
                  onClick={() => router.push('/apps/admin/reports/statistics')}
                >
                  ไปหน้าสถิติระบบ
                </Button>
              </Stack>

              <Grid container spacing={2.5}>
                {quickActions.map((item) => (
                  <Grid key={item.id} size={{ xs: 12, md: 6, xl: 4 }}>
                    <ActionButton
                      id={`admin-home-quick-action-${item.id}`}
                      variant='outlined'
                      onClick={() => router.push(item.path)}
                    >
                      <Stack direction='row' spacing={2} sx={{ alignItems: 'center', width: '100%' }}>
                        <CustomAvatar skin='light' color='primary' sx={{ width: 44, height: 44 }}>
                          <IconifyIcon icon={item.icon} />
                        </CustomAvatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                            {item.title}
                          </Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            {item.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </ActionButton>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, mb: 1 }}>
                    ภาพรวมการติดตามประจำเดือน
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    ใช้ยืนยันว่า admin กำลังดูข้อมูลส่วนกลางของวิทยาลัย ไม่ใช่ขอบเขตห้องเรียนของครูรายบุคคล
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant='outlined' sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                      <Stack spacing={1.5}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                          วันที่มาเรียนดีที่สุด
                        </Typography>
                        <Typography variant='h6' sx={{ color: 'success.main', fontWeight: 800 }}>
                          {dailyHighlights.bestDay ? formatDisplayDate(dailyHighlights.bestDay.date) : '-'}
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                          อัตราเข้าแถว {dailyHighlights.bestDay ? dailyHighlights.bestDay.attendanceRate.toFixed(2) : '0.00'}%
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant='outlined' sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                      <Stack spacing={1.5}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                          วันที่ต้องเฝ้าระวังมากที่สุด
                        </Typography>
                        <Typography variant='h6' sx={{ color: 'error.main', fontWeight: 800 }}>
                          {dailyHighlights.worstDay ? formatDisplayDate(dailyHighlights.worstDay.date) : '-'}
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                          อัตราเข้าแถว {dailyHighlights.worstDay ? dailyHighlights.worstDay.attendanceRate.toFixed(2) : '0.00'}%
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                <Paper
                  variant='outlined'
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    borderColor: alpha(theme.palette.primary.main, 0.16),
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      จุดที่ควรติดตามต่อ
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      ครูที่ยังไม่มีข้อมูลเช็คชื่อในช่วงนี้ {numberFormatter.format(statistics?.teacherUsageStats.inactiveTeachers ?? 0)} คน
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      รายการเยี่ยมบ้านที่ถูกรวมในรายงาน {numberFormatter.format(visitOverview.totalRows)} รายการ
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      อัปเดตเช็คชื่อวันล่าสุด {formatDisplayDate(dailyHighlights.latestDay?.date)}
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, mb: 1 }}>
                    ครูที่ใช้งานเช็คชื่อมากที่สุด
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    จัดอันดับจากจำนวนครั้งการเช็คชื่อในช่วงข้อมูลที่เลือก
                  </Typography>
                </Box>

                {teacherHighlights.length > 0 ? (
                  <Stack spacing={2}>
                    {teacherHighlights.map((teacher, index) => (
                      <Paper key={teacher.teacherDbId} variant='outlined' sx={{ p: 2.5, borderRadius: 3 }}>
                        <Stack direction='row' spacing={2} sx={{ alignItems: 'flex-start' }}>
                          <CustomAvatar skin='light' color='secondary' sx={{ width: 40, height: 40 }}>
                            {index + 1}
                          </CustomAvatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                              {teacher.teacherName}
                            </Typography>
                            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                              {teacher.department || 'ไม่ระบุแผนก'} {teacher.program ? `• ${teacher.program}` : ''}
                            </Typography>
                            <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.75 }}>
                              เช็คชื่อ {numberFormatter.format(teacher.checkInCount)} ครั้ง • ล่าสุด {formatDisplayDate(teacher.lastCheckInDate)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Paper variant='outlined' sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      ยังไม่มีข้อมูลการใช้งานครูในช่วงวันที่นี้
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, mb: 1 }}>
                    รายงานเยี่ยมบ้านล่าสุด
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    แสดงรายการล่าสุดตามครู วันที่บันทึกล่าสุด ห้องเรียน และจำนวนนักเรียนใน scope ของครูที่ปรึกษา
                  </Typography>
                </Box>
                <Button
                  id='admin-home-open-visit-report-button'
                  variant='outlined'
                  endIcon={<IconifyIcon icon='mdi:home-search-outline' />}
                  onClick={() => router.push('/apps/admin/reports/visit')}
                >
                  ดูรายงานเยี่ยมบ้านทั้งหมด
                </Button>
              </Stack>

              {isLoadingVisits && recentVisitRows.length === 0 ? (
                <Grid container spacing={2}>
                  {[0, 1, 2].map((item) => (
                    <Grid key={item} size={{ xs: 12, md: 4 }}>
                      <Skeleton variant='rounded' height={140} sx={{ borderRadius: 4 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : recentVisitRows.length > 0 ? (
                <Grid container spacing={2}>
                  {recentVisitRows.map((row) => (
                    <Grid key={row.id} size={{ xs: 12, md: 6, xl: 4 }}>
                      <Paper variant='outlined' sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Stack spacing={1.25}>
                          <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
                            <CustomAvatar skin='light' color='info' sx={{ width: 40, height: 40 }}>
                              <HiOutlineDocumentReport style={{ fontSize: '1.1rem' }} />
                            </CustomAvatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                                {row.teacherName}
                              </Typography>
                              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                                {row.departmentName}
                              </Typography>
                            </Box>
                          </Stack>
                          <Divider />
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            วันที่บันทึกล่าสุด {formatDisplayDate(getAdminVisitRecordedAt(row))}
                          </Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            ห้องเรียน {row.classroomName}
                          </Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            ความคืบหน้า {numberFormatter.format(row.recordedStudentCount)}/
                            {numberFormatter.format(row.studentCount)} คน
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper variant='outlined' sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    ยังไม่มีรายงานเยี่ยมบ้านในช่วงข้อมูลที่เลือก
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper variant='outlined' sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Stack spacing={1.5}>
                      <CustomAvatar skin='light' color='primary' sx={{ width: 44, height: 44 }}>
                        <HiOutlineClipboardList style={{ fontSize: '1.25rem' }} />
                      </CustomAvatar>
                      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                        ขาดเรียนสะสม
                      </Typography>
                      <Typography variant='h5' sx={{ fontWeight: 800, color: 'error.main' }}>
                        {numberFormatter.format(statistics?.studentCheckInStats.totals.absent ?? 0)}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper variant='outlined' sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Stack spacing={1.5}>
                      <CustomAvatar skin='light' color='warning' sx={{ width: 44, height: 44 }}>
                        <TbChartBar style={{ fontSize: '1.25rem' }} />
                      </CustomAvatar>
                      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                        มาสายสะสม
                      </Typography>
                      <Typography variant='h5' sx={{ fontWeight: 800, color: 'warning.main' }}>
                        {numberFormatter.format(statistics?.studentCheckInStats.totals.late ?? 0)}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper variant='outlined' sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Stack spacing={1.5}>
                      <CustomAvatar skin='light' color='info' sx={{ width: 44, height: 44 }}>
                        <MdManageAccounts style={{ fontSize: '1.25rem' }} />
                      </CustomAvatar>
                      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                        ครูที่ยังไม่ใช้งาน
                      </Typography>
                      <Typography variant='h5' sx={{ fontWeight: 800, color: 'info.main' }}>
                        {numberFormatter.format(statistics?.teacherUsageStats.inactiveTeachers ?? 0)}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper variant='outlined' sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Stack spacing={1.5}>
                      <CustomAvatar skin='light' color='secondary' sx={{ width: 44, height: 44 }}>
                        <MdOutlineClass style={{ fontSize: '1.25rem' }} />
                      </CustomAvatar>
                      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                        นักเรียนฝึกงาน
                      </Typography>
                      <Typography variant='h5' sx={{ fontWeight: 800, color: 'secondary.main' }}>
                        {numberFormatter.format(statistics?.studentCheckInStats.totals.internship ?? 0)}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminHomePage;