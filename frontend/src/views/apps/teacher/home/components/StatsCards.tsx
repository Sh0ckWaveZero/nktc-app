'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { HiOutlineDatabase, HiOutlineFlag } from 'react-icons/hi';
import { MdOutlineHome } from 'react-icons/md';
import CustomAvatar from '@/@core/components/mui/avatar';
import IconifyIcon from '@/@core/components/icon';
import type { DashboardStats } from '../hooks/useTeacherDashboard';
import { GlassCard } from '../styles';

interface StatsCardsProps {
  dashboardStats: DashboardStats;
  isLoading: boolean;
}

const StatsCards = ({ dashboardStats, isLoading }: StatsCardsProps) => {
  if (isLoading) {
    return (
      <>
        {Array.from(new Array(4)).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`skeleton-stat-${index}`}>
            <Card sx={{ p: 4 }}>
              <Skeleton variant='circular' width={40} height={40} sx={{ mb: 2 }} />
              <Skeleton variant='text' width='60%' height={24} sx={{ mb: 1 }} />
              <Skeleton variant='text' width='40%' height={32} />
            </Card>
          </Grid>
        ))}
      </>
    );
  }

  return (
    <>
      {/* Card 1: Student Count */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <GlassCard>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  นักเรียนทั้งหมดในความดูแล
                </Typography>
                <Typography variant='h4' sx={{ fontWeight: 700, mt: 1, color: 'primary.main' }}>
                  {dashboardStats.totalCount} คน
                </Typography>
              </Box>
              <CustomAvatar skin='light' color='primary' sx={{ width: 48, height: 48 }}>
                <HiOutlineDatabase style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                ชาย {dashboardStats.maleCount} คน | หญิง {dashboardStats.femaleCount} คน
              </Typography>
              <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />
              <Typography variant='caption' sx={{ color: 'secondary.main', fontWeight: 600 }}>
                ปกติ {dashboardStats.normalCount} | ฝึกงาน {dashboardStats.internCount}
              </Typography>
            </Box>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Card 2: Today's Attendance */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <GlassCard>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  อัตราการเข้าเรียนวันนี้
                </Typography>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    color: dashboardStats.attendance.attendanceRate >= 90 ? 'success.main' : 'warning.main',
                  }}
                >
                  {dashboardStats.attendance.attendanceRate}%
                </Typography>
              </Box>
              <CustomAvatar
                skin='light'
                color={dashboardStats.attendance.attendanceRate >= 90 ? 'success' : 'warning'}
                sx={{ width: 48, height: 48 }}
              >
                <HiOutlineFlag style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600 }}>
                มา {dashboardStats.attendance.present}
              </Typography>
              <Typography variant='caption' sx={{ color: 'warning.main' }}>
                สาย {dashboardStats.attendance.late}
              </Typography>
              <Typography variant='caption' sx={{ color: 'info.main' }}>
                ลา {dashboardStats.attendance.leave}
              </Typography>
              <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600 }}>
                ขาด {dashboardStats.attendance.absent}
              </Typography>
            </Box>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Card 3: Goodness Score */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <GlassCard>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  คะแนนความดีสะสมรวม
                </Typography>
                <Typography variant='h4' sx={{ fontWeight: 700, mt: 1, color: 'success.main' }}>
                  {dashboardStats.behavior.totalGoodnessScore} แต้ม
                </Typography>
              </Box>
              <CustomAvatar skin='light' color='success' sx={{ width: 48, height: 48 }}>
                <IconifyIcon icon='solar:star-bold-duotone' style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant='caption'
                sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                ทำความดี {dashboardStats.behavior.goodnessTotalCount} ครั้ง
              </Typography>
              <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
              <Typography
                variant='caption'
                sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                ทำผิดกฎ {dashboardStats.behavior.badnessTotalCount} ครั้ง
              </Typography>
            </Box>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Card 4: Home Visits Progress */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <GlassCard>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  ความคืบหน้าการเยี่ยมบ้าน
                </Typography>
                <Typography variant='h4' sx={{ fontWeight: 700, mt: 1, color: 'info.main' }}>
                  {dashboardStats.tasks.visitProgress}%
                </Typography>
              </Box>
              <CustomAvatar skin='light' color='info' sx={{ width: 48, height: 48 }}>
                <MdOutlineHome style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            </Box>
            <Box sx={{ width: '100%', mb: 1 }}>
              <LinearProgress
                variant='determinate'
                value={dashboardStats.tasks.visitProgress}
                color='info'
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              เยี่ยมแล้ว {dashboardStats.tasks.visitedCount} จาก {dashboardStats.tasks.taskPopulationCount} คน
              {' '}(คัดกรอง SDQ {dashboardStats.tasks.sdqProgress}%)
            </Typography>
          </CardContent>
        </GlassCard>
      </Grid>
    </>
  );
};

export default StatsCards;
