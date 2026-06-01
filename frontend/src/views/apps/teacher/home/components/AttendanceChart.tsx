'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { MdChevronRight } from 'react-icons/md';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WEEKLY_ATTENDANCE_CHART_DATA } from '../constants';

interface AttendanceChartProps {
  isMounted: boolean;
}

const AttendanceChart = ({ isMounted }: AttendanceChartProps) => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card sx={{ height: '100%', minHeight: '380px' }}>
      <CardHeader
        title={
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            สถิติและแนวโน้มการเข้าเรียน
          </Typography>
        }
        action={
          <Button
            size='small'
            variant='outlined'
            onClick={() => router.push('/apps/reports/check-in/summary')}
            endIcon={<MdChevronRight />}
          >
            รายงานทั้งหมด
          </Button>
        }
      />
      <CardContent sx={{ pb: 6 }}>
        {isMounted ? (
          <Box sx={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={WEEKLY_ATTENDANCE_CHART_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id='attendanceGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={theme.palette.primary.main} stopOpacity={0.4} />
                    <stop offset='95%' stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} vertical={false} />
                <XAxis dataKey='name' stroke={theme.palette.text.secondary} fontSize={12} />
                <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} fontSize={12} tickCount={6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='อัตรามาเรียน (%)'
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill='url(#attendanceGradient)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
