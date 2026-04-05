'use client';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { DailyChartDatum } from '@/hooks/queries/useStatistics';

const formatChartDate = (dateInput: string): string => {
  const date = new Date(dateInput);

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
  }).format(date);
};

interface DailyAttendanceChartProps {
  dailyData: DailyChartDatum[];
}

const DailyAttendanceChart = ({ dailyData }: DailyAttendanceChartProps) => {
  const chartData = dailyData.map((day) => ({
    ...day,
    label: formatChartDate(day.date),
  }));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            แนวโน้มการเข้าแถวรายวัน
          </Typography>
          <Typography variant='body2' sx={{ mt: 0.75, color: 'text.secondary', maxWidth: 420 }}>
            แสดงอัตราการเข้าแถวต่อวันจากสูตร มาเข้าแถว ÷ จำนวนที่ถูกเช็คชื่อจริงในวันนั้น
          </Typography>
        </Box>

        <Stack spacing={0.5} alignItems='flex-end'>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
            จำนวนวันที่มีข้อมูล
          </Typography>
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            {dailyData.length.toLocaleString()}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 320, width: '100%', minWidth: 0 }}>
        <ResponsiveContainer width='100%' height={320} minWidth={0}>
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 6 }}>
            <defs>
              <linearGradient id='attendanceAreaGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#2F7DFF' stopOpacity={0.36} />
                <stop offset='95%' stopColor='#2F7DFF' stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='4 4' strokeOpacity={0.18} vertical={false} />
            <XAxis dataKey='label' tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const row = payload[0]?.payload as DailyChartDatum | undefined;

                if (!row) {
                  return null;
                }

                return (
                  <Box
                    sx={{
                      borderRadius: 2.5,
                      border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                      bgcolor: 'background.paper',
                      px: 1.5,
                      py: 1.25,
                      boxShadow: (theme) => `0 18px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{formatChartDate(row.date)}</Typography>
                    <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
                      อัตราเข้าแถว {row.attendanceRate.toFixed(2)}%
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      เช็คชื่อรวม {row.checkedRecords.toLocaleString()} รายการ
                    </Typography>
                  </Box>
                );
              }}
              contentStyle={{
                borderRadius: 14,
                border: `1px solid ${alpha('#2F7DFF', 0.14)}`,
                boxShadow: `0 18px 42px ${alpha('#12233d', 0.12)}`,
              }}
            />
            <Area
              type='monotone'
              dataKey='attendanceRate'
              stroke='#2F7DFF'
              strokeWidth={3}
              fill='url(#attendanceAreaGradient)'
              name='attendanceRate'
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default DailyAttendanceChart;
