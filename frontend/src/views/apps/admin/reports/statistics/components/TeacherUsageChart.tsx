'use client';

import { CardHeader } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TeacherUsageChartProps {
  activeTeachers: number;
  inactiveTeachers: number;
}

const COLORS = {
  active: '#4caf50',
  inactive: '#f44336',
};

const TeacherUsageChart = ({ activeTeachers, inactiveTeachers }: TeacherUsageChartProps) => {
  const data = [
    { name: 'เข้าใช้งาน', value: activeTeachers },
    { name: 'ไม่ได้ใช้งาน', value: inactiveTeachers },
  ];

  const total = activeTeachers + inactiveTeachers;

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${entry.name}: ${percent}%`;
  };

  return (
    <>
      <CardHeader
        title="สัดส่วนการใช้งานของครู"
        titleTypographyProps={{
          variant: 'h6',
          sx: { fontSize: { xs: '1rem', sm: '1.25rem' } }
        }}
      />
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius="60%"
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.active : COLORS.inactive} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value} คน`} />
          <Legend
            wrapperStyle={{ fontSize: '0.875rem' }}
            iconSize={12}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

export default TeacherUsageChart;
