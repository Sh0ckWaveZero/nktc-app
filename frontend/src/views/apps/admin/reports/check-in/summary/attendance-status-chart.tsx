import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';

import { ATTENDANCE_STATUSES } from '@/utils/attendance-summary';

import type { ReactElement } from 'react';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';

interface AttendanceStatusChartProps {
  totals: AttendanceSummary['totals'];
}

const AttendanceStatusChart = dynamic<AttendanceStatusChartProps>(
  async () => {
    const { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } = await import('recharts');
    const StatusChart = ({ totals }: AttendanceStatusChartProps): ReactElement => {
      const theme = useTheme();
      const rows = ATTENDANCE_STATUSES.map((status) => ({ ...status, value: totals[status.key] }));
      return (
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              สัดส่วนสถานะการเช็คชื่อ
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              รวม {totals.total.toLocaleString()} ครั้ง · หนึ่งคนต่อหนึ่งวัน
            </Typography>
            <Box
              role='img'
              aria-label='กราฟสัดส่วนสถานะการเช็คชื่อทั้งห้าสถานะ'
              sx={{ width: '100%', height: 220, minWidth: 0 }}
            >
              <ResponsiveContainer width='100%' height={220} minWidth={0}>
                <PieChart>
                  <Pie
                    data={rows}
                    dataKey='value'
                    nameKey='label'
                    innerRadius='58%'
                    outerRadius='85%'
                    stroke='none'
                    isAnimationActive={false}
                  >
                    {rows.map((row) => (
                      <Cell key={row.key} fill={row.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value): string => `${Number(value).toLocaleString()} ครั้ง`}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={1}>
              {rows.map((row) => (
                <Stack key={row.key} direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }} />
                  <Typography variant='body2' sx={{ flex: 1 }}>
                    {row.label}
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700 }}>
                    {row.value.toLocaleString()} ครั้ง
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ width: 55, textAlign: 'right' }}>
                    {totals.total ? ((row.value / totals.total) * 100).toFixed(1) : '0'}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      );
    };
    return StatusChart;
  },
  { ssr: false },
);

export default AttendanceStatusChart;
