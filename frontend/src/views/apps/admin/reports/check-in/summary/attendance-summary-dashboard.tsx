import { ExpandMoreOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { parseISO } from 'date-fns';

import { formatThaiDate } from '@/@core/utils/thai-calendar';
import { getAttendanceInsights } from '@/utils/attendance-summary';

import type { ReactElement } from 'react';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';

import AttendanceClassroomTable from './attendance-classroom-table';
import AttendanceDepartmentComparison from './attendance-department-comparison';
import AttendanceStatusChart from './attendance-status-chart';
import AttendanceSummaryCards from './attendance-summary-cards';
import AttendanceSummaryExportButton from './attendance-summary-export-button';
import AttendanceWeeklyChart from './attendance-weekly-chart';

interface AttendanceSummaryDashboardProps {
  data: AttendanceSummary;
}

const AttendanceSummaryDashboard = ({ data }: AttendanceSummaryDashboardProps): ReactElement => (
  <Stack spacing={3}>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
    >
      <Typography variant='body2' color='text.secondary'>
        {data.period.name} · สรุปข้อมูลถึง {formatThaiDate(parseISO(data.period.throughDate))}
      </Typography>
      <AttendanceSummaryExportButton data={data} />
    </Stack>
    <AttendanceSummaryCards data={data} />
    {!data.totals.total ? (
      <Alert severity='info'>
        {data.period.hasStarted
          ? 'ยังไม่มีข้อมูลเช็คชื่อในภาคเรียนนี้ เลือกภาคเรียนอื่นหรือกลับมาตรวจหลังมีการบันทึก'
          : 'ภาคเรียนนี้ยังไม่เริ่ม ระบบจะแสดงสถิติเมื่อมีการเช็คชื่อหลังวันเปิดเทอม'}
      </Alert>
    ) : (
      <>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <AttendanceWeeklyChart weeks={data.weekly} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AttendanceStatusChart totals={data.totals} />
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <AttendanceDepartmentComparison departments={data.departments} />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='h6' sx={{ fontWeight: 700, mb: 3 }}>
                  สรุปให้อ่านง่าย
                </Typography>
                <Stack spacing={3}>
                  {getAttendanceInsights(data).map((insight) => (
                    <Alert key={insight.title} severity={insight.tone}>
                      <Typography variant='subtitle2' sx={{ mb: 1 }}>
                        {insight.title}
                      </Typography>
                      {insight.body}
                    </Alert>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <AttendanceClassroomTable classrooms={data.classrooms} />
      </>
    )}
    {data.quality.duplicateEntries > 0 && (
      <Alert severity='info'>
        พบรายการซ้ำ {data.quality.duplicateEntries.toLocaleString()} ครั้ง
        ระบบนับนักเรียนหนึ่งคนต่อวันและใช้สถานะจากบันทึกที่แก้ไขล่าสุดแล้ว
      </Alert>
    )}
    {data.quality.conflictingStudentDays > 0 && (
      <Alert severity='warning'>
        พบ {data.quality.conflictingStudentDays.toLocaleString()} คน-วันที่ระบุหลายสถานะในบันทึกล่าสุด
        จึงแยกออกจากยอดสรุป กรุณาตรวจสอบบันทึกต้นทาง
      </Alert>
    )}
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
        <Typography sx={{ fontWeight: 600 }}>ตัวเลขนี้คิดอย่างไร</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          <Typography variant='body2'>
            หนึ่งคนต่อหนึ่งวันนับเป็นหนึ่งครั้ง เช่น นักเรียนคนเดิมมาตรงเวลา 5 วัน จะนับเป็น 5 ครั้ง แต่ยังเป็นนักเรียน
            1 คน
          </Typography>
          <Typography variant='body2'>
            อัตรามาตรงเวลา = มา ÷ (มา + สาย + ขาด) × 100 โดยลาและฝึกงานแสดงแยกและไม่รวมในตัวหาร
          </Typography>
          <Typography variant='body2'>
            ใช้บันทึกในภาคเรียนตามปฏิทินการศึกษาถึงวันปัจจุบัน วันที่ยังไม่บันทึกและวันในอนาคตจะไม่ถูกนับเป็นขาดเรียน
          </Typography>
          <Typography variant='body2'>
            ข้อมูลแผนกและห้องเรียนอ้างอิงห้องที่ผูกกับบันทึกเช็คชื่อ จำนวนนักเรียนคือคนที่มีข้อมูลจริงในช่วงที่เลือก
          </Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  </Stack>
);

export default AttendanceSummaryDashboard;
