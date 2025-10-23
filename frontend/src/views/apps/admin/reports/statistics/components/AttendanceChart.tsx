'use client';

import { CardHeader } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AttendanceChartProps {
  studentsCheckedIn: number;
  studentsNotCheckedIn: number;
}

const COLORS = {
  checkedIn: '#4caf50',
  notCheckedIn: '#f44336',
};

const AttendanceChart = ({ studentsCheckedIn, studentsNotCheckedIn }: AttendanceChartProps) => {
  const data = [
    { name: 'มาเข้าแถว', value: studentsCheckedIn },
    { name: 'ไม่มาเข้าแถว', value: studentsNotCheckedIn },
  ];

  const total = studentsCheckedIn + studentsNotCheckedIn;

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${entry.name}: ${percent}%`;
  };

  return (
    <>
      <CardHeader
        title='สัดส่วนการมาเข้าแถวของนักเรียน'
        slotProps={{
          title: {
            variant: 'h6',
            sx: { fontSize: { xs: '1rem', sm: '1.25rem' } },
          },
        }}
      />
      <ResponsiveContainer width='100%' height='100%' minHeight={250}>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={renderLabel}
            outerRadius='60%'
            fill='#8884d8'
            dataKey='value'
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.checkedIn : COLORS.notCheckedIn} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value} คน`} />
          <Legend wrapperStyle={{ fontSize: '0.875rem' }} iconSize={12} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

export default AttendanceChart;
