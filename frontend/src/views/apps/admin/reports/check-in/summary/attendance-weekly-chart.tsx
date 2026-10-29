import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';

import type { ReactElement } from 'react';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';

interface AttendanceWeeklyChartProps {
  weeks: AttendanceSummary['weekly'];
}

const AttendanceWeeklyChart = dynamic<AttendanceWeeklyChartProps>(
  async () => {
    const { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } = await import('recharts');
    const WeeklyChart = ({ weeks }: AttendanceWeeklyChartProps): ReactElement => {
      const theme = useTheme();
      return (
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              แนวโน้มมาตรงเวลารายสัปดาห์
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1, mb: 3 }}>
              ดูว่าสัดส่วนมาตรงเวลาเพิ่มขึ้นหรือลดลง · ช่วงที่ไม่มีข้อมูลจะแสดงเป็นช่องว่าง
            </Typography>
            <Box role='img' aria-label='กราฟอัตรามาตรงเวลารายสัปดาห์' sx={{ width: '100%', minWidth: 0, height: 300 }}>
              <ResponsiveContainer width='100%' height={300} minWidth={0}>
                <LineChart data={weeks} margin={{ top: 15, right: 15, bottom: 10, left: 0 }}>
                  <CartesianGrid stroke={theme.palette.divider} strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='week'
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    tickLine={false}
                    label={{
                      value: 'สัปดาห์',
                      position: 'insideBottomRight',
                      offset: -5,
                      fill: theme.palette.text.secondary,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit='%'
                    width={52}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                    }}
                    formatter={(value): string => (typeof value === 'number' ? `${value.toFixed(2)}%` : 'ไม่มีข้อมูล')}
                    labelFormatter={(label): string => `สัปดาห์ที่ ${String(label)}`}
                  />
                  <Line
                    name='อัตรามาตรงเวลา'
                    type='linear'
                    dataKey='punctualityRate'
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    connectNulls={false}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      );
    };
    return WeeklyChart;
  },
  { ssr: false },
);

export default AttendanceWeeklyChart;
