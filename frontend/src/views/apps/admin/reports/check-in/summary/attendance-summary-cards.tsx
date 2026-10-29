import { CalendarMonthOutlined, GroupsOutlined, PersonOffOutlined, TaskAltOutlined } from '@mui/icons-material';
import { Grid } from '@mui/material';

import { formatAttendanceRate } from '@/utils/attendance-summary';
import StatisticsCard from '@/views/apps/admin/reports/statistics/components/StatisticsCard';

import type { ReactElement } from 'react';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';

interface AttendanceSummaryCardsProps {
  data: AttendanceSummary;
}

const AttendanceSummaryCards = ({ data }: AttendanceSummaryCardsProps): ReactElement => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
      <StatisticsCard
        title='อัตรามาตรงเวลา'
        value={formatAttendanceRate(data.totals.punctualityRate)}
        caption='มา ÷ (มา + สาย + ขาด)'
        insight='ไม่รวมลาและฝึกงานในตัวหาร'
        icon={<TaskAltOutlined />}
        tone='success'
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
      <StatisticsCard
        title='นักเรียนที่มีข้อมูล'
        value={`${data.uniqueStudents.toLocaleString()} คน`}
        caption={`จาก ${data.classroomsCount.toLocaleString()} ห้องเรียน`}
        insight='นับนักเรียนไม่ซ้ำในภาคเรียน'
        icon={<GroupsOutlined />}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
      <StatisticsCard
        title='ขาดเรียนสะสม'
        value={`${data.totals.absent.toLocaleString()} ครั้ง`}
        caption='หนึ่งคนขาดหนึ่งวัน = หนึ่งครั้ง'
        insight='นับเฉพาะสถานะขาดที่บันทึกไว้'
        icon={<PersonOffOutlined />}
        tone='warning'
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
      <StatisticsCard
        title='วันที่บันทึกแล้ว'
        value={`${data.recordedDays.toLocaleString()} วัน`}
        caption='วันที่มีข้อมูลเช็คชื่อจริง'
        insight='วันที่ไม่มีข้อมูลไม่ถือว่าขาด'
        icon={<CalendarMonthOutlined />}
        tone='info'
      />
    </Grid>
  </Grid>
);

export default AttendanceSummaryCards;
