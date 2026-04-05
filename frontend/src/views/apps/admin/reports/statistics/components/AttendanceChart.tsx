'use client';

import { alpha } from '@mui/material/styles';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface AttendanceChartProps {
  studentsCheckedIn: number;
  studentsNotCheckedIn: number;
  averageAttendanceRate: number;
}

const COLORS = ['#2F7DFF', '#FF9F43'];

const AttendanceChart = ({
  studentsCheckedIn,
  studentsNotCheckedIn,
  averageAttendanceRate,
}: AttendanceChartProps) => {
  const data = [
    { name: 'มาเข้าแถว', value: studentsCheckedIn },
    { name: 'ไม่มาตามปกติ', value: studentsNotCheckedIn },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            สัดส่วนการเข้าแถว
          </Typography>
          <Typography variant='body2' sx={{ mt: 0.75, color: 'text.secondary', maxWidth: 320 }}>
            เปรียบเทียบจำนวนการเช็คชื่อที่มาเข้าแถวกับกลุ่มที่ขาด มาสาย ลา หรือฝึกงาน
          </Typography>
        </Box>

        <Chip
          label={`เฉลี่ย ${averageAttendanceRate.toFixed(2)}%`}
          size='small'
          sx={{
            mt: 0.25,
            borderRadius: 1.75,
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
            color: 'primary.main',
            fontWeight: 700,
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 280, width: '100%', minWidth: 0 }}>
        <ResponsiveContainer width='100%' height={280} minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              dataKey='value'
              nameKey='name'
              innerRadius='58%'
              outerRadius='82%'
              paddingAngle={3}
              stroke='none'
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const row = payload[0]?.payload as { name: string; value: number } | undefined;

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
                    <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography>
                    <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
                      {row.value.toLocaleString()} รายการ
                    </Typography>
                  </Box>
                );
              }}
            />
            <Legend verticalAlign='bottom' iconType='circle' />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Stack direction='row' spacing={1.25} sx={{ mt: 1, flexWrap: 'wrap' }}>
        {data.map((item, index) => (
          <Box
            key={item.name}
            sx={{
              minWidth: 0,
              flex: { xs: '1 1 100%', sm: '1 1 0' },
              borderRadius: 2.5,
              p: 1.5,
              border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              bgcolor: (theme) => alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.02 : 0.6),
            }}
          >
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {item.name}
            </Typography>
            <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: '1.1rem', color: COLORS[index] }}>
              {item.value.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default AttendanceChart;
