'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import IconifyIcon from '@/@core/components/icon';
import type { DashboardStats, EducationalInsight } from '../hooks/useTeacherDashboard';

interface PedagogyInsightsProps {
  educationalInsight: EducationalInsight;
  dashboardStats: DashboardStats;
}

const PedagogyInsights = ({ educationalInsight, dashboardStats }: PedagogyInsightsProps) => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            มุมคิดช่วยครู พัฒนาการศึกษา (Advisor Insights & Pedagogy)
          </Typography>
        }
        subheader='จิตวิทยาเด็กและเทคนิคการจัดการชั้นเรียนประจำวันเพื่ออนาคตที่ดีกว่า'
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 2,
            position: 'relative',
          }}
        >
          <Typography variant='h6' sx={{ color: 'primary.main', mb: 2, fontWeight: 700 }}>
            💡 เกร็ดคิดแนะแนววันนี้
          </Typography>
          <Typography
            variant='body1'
            sx={{
              fontStyle: 'italic',
              mb: 2,
              color: 'text.primary',
              fontWeight: 500,
              pl: 3,
              borderLeft: `3px solid ${theme.palette.primary.main}`,
            }}
          >
            "{educationalInsight.quote}"
          </Typography>
          <Typography
            variant='caption'
            sx={{ display: 'block', textAlign: 'right', color: 'text.secondary', fontWeight: 600, mb: 3 }}
          >
            — {educationalInsight.author}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
            📌 แนะนำเทคนิคสำหรับครู:
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {educationalInsight.tip}
          </Typography>
        </Paper>

        <Typography
          variant='subtitle2'
          sx={{ fontWeight: 700, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <IconifyIcon icon='solar:list-check-bold-duotone' />
          ภารกิจงานที่ปรึกษาที่ต้องติดตามดำเนินการ
        </Typography>

        <Grid container spacing={3}>
          <Grid size={6}>
            <Paper
              variant='outlined'
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.25s',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <Box>
                <Typography
                  variant='caption'
                  sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}
                >
                  การประเมินคัดกรอง SDQ
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                  {dashboardStats.tasks.sdqCount} / {dashboardStats.totalCount} คน
                </Typography>
                {dashboardStats.totalCount - dashboardStats.tasks.sdqCount > 0 ? (
                  <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600, display: 'block' }}>
                    ⚠️ ค้างคัดกรองอีก {dashboardStats.totalCount - dashboardStats.tasks.sdqCount} คน
                  </Typography>
                ) : (
                  <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600, display: 'block' }}>
                    ✅ คัดกรองครบ 100% แล้ว
                  </Typography>
                )}
              </Box>
              <Button
                size='small'
                variant={dashboardStats.totalCount - dashboardStats.tasks.sdqCount > 0 ? 'contained' : 'outlined'}
                color='primary'
                sx={{ mt: 3, borderRadius: 2 }}
                onClick={() => router.push('/apps/visit/sdq')}
              >
                {dashboardStats.totalCount - dashboardStats.tasks.sdqCount > 0
                  ? 'เริ่มประเมินคัดกรอง'
                  : 'ดูผลการประเมิน'}
              </Button>
            </Paper>
          </Grid>

          <Grid size={6}>
            <Paper
              variant='outlined'
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.25s',
                '&:hover': { borderColor: 'info.main' },
              }}
            >
              <Box>
                <Typography
                  variant='caption'
                  sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}
                >
                  เยี่ยมบ้านนักเรียน
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 800, color: 'info.main', mb: 1 }}>
                  {dashboardStats.tasks.visitedCount} / {dashboardStats.totalCount} คน
                </Typography>
                {dashboardStats.totalCount - dashboardStats.tasks.visitedCount > 0 ? (
                  <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600, display: 'block' }}>
                    ⚠️ ค้างเยี่ยมบ้านอีก {dashboardStats.totalCount - dashboardStats.tasks.visitedCount} คน
                  </Typography>
                ) : (
                  <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600, display: 'block' }}>
                    ✅ เยี่ยมบ้านครบ 100% แล้ว
                  </Typography>
                )}
              </Box>
              <Button
                size='small'
                variant={
                  dashboardStats.totalCount - dashboardStats.tasks.visitedCount > 0 ? 'contained' : 'outlined'
                }
                color='info'
                sx={{ mt: 3, borderRadius: 2 }}
                onClick={() => router.push('/apps/visit/list')}
              >
                {dashboardStats.totalCount - dashboardStats.tasks.visitedCount > 0
                  ? 'เริ่มบันทึกเยี่ยมบ้าน'
                  : 'ดูประวัติเยี่ยมบ้าน'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PedagogyInsights;
