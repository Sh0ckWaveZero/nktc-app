import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { formatAttendanceRate } from '@/utils/attendance-summary';

import type { ReactElement } from 'react';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';

const INITIAL_DEPARTMENTS: number = 6;
interface AttendanceDepartmentComparisonProps {
  departments: AttendanceSummary['departments'];
}

const AttendanceDepartmentComparison = ({ departments }: AttendanceDepartmentComparisonProps): ReactElement => {
  const [hasExpanded, setHasExpanded] = useState<boolean>(false);
  const sorted: AttendanceSummary['departments'] = [...departments].sort(
    (left, right): number =>
      (left.punctualityRate ?? Infinity) - (right.punctualityRate ?? Infinity) ||
      left.name.localeCompare(right.name, 'th'),
  );
  const visible: AttendanceSummary['departments'] = hasExpanded ? sorted : sorted.slice(0, INITIAL_DEPARTMENTS);
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' sx={{ fontWeight: 700 }}>
          เปรียบเทียบแผนกวิชา
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1, mb: 3 }}>
          เรียงตามอัตราตรงเวลาจากน้อยไปมาก · ใช้ข้อมูลที่บันทึกในภาคเรียนนี้
        </Typography>
        <Stack spacing={3}>
          {visible.map((department) => (
            <Box key={department.id}>
              <Stack
                direction='row'
                spacing={2}
                sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
              >
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {department.name}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {formatAttendanceRate(department.punctualityRate)}
                </Typography>
              </Stack>
              {department.punctualityRate !== null && (
                <LinearProgress
                  variant='determinate'
                  value={department.punctualityRate}
                  aria-label={`อัตราตรงเวลา ${department.name}`}
                  sx={{ height: 7, borderRadius: 2 }}
                />
              )}
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                มา {department.present.toLocaleString()} · สาย {department.late.toLocaleString()} · ขาด{' '}
                {department.absent.toLocaleString()} ครั้ง · นักเรียนที่มีข้อมูล{' '}
                {department.uniqueStudents.toLocaleString()} คน
              </Typography>
            </Box>
          ))}
        </Stack>
        {departments.length > INITIAL_DEPARTMENTS && (
          <Button sx={{ mt: 2 }} onClick={(): void => setHasExpanded(!hasExpanded)}>
            {hasExpanded ? 'แสดงน้อยลง' : `ดูทั้งหมด ${departments.length} แผนก`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceDepartmentComparison;
