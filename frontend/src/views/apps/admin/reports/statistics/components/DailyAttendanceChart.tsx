'use client';

import { CardHeader } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
// Date formatting helper using Intl.DateTimeFormat
const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'numeric',
  }).format(date);
};

interface DailyAttendanceChartProps {
  dailyData: Array<{
    date: string | Date;
    present: number;
    absent: number;
    late: number;
    leave: number;
    internship: number;
  }>;
}

const DailyAttendanceChart = ({ dailyData }: DailyAttendanceChartProps) => {
  const chartData = dailyData?.map((day) => ({
    date: formatChartDate(day.date),
    มาเรียน: day.present,
    ขาดเรียน: day.absent,
    มาสาย: day.late,
    ลา: day.leave,
    ฝึกงาน: day.internship,
  })) || [];

  return (
    <>
      <CardHeader
        title="กราฟการเข้าเรียนรายวัน"
        titleTypographyProps={{
          variant: 'h6',
          sx: { fontSize: { xs: '1rem', sm: '1.25rem' } }
        }}
      />
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ fontSize: '0.875rem' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.875rem' }}
            iconSize={12}
          />
          <Bar dataKey="มาเรียน" fill="#4caf50" />
          <Bar dataKey="ขาดเรียน" fill="#f44336" />
          <Bar dataKey="มาสาย" fill="#ff9800" />
          <Bar dataKey="ลา" fill="#2196f3" />
          <Bar dataKey="ฝึกงาน" fill="#9c27b0" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default DailyAttendanceChart;
