'use client';

import { Alert, Avatar, Box, Button, Card, CardHeader, Grid, MenuItem, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { BsCalendar2Date } from 'react-icons/bs';

import Spinner from '@/@core/components/spinner';
import { formatThaiDate } from '@/@core/utils/thai-calendar';
import { getAdminCheckInReportPeriodLabel } from '@/utils/admin-check-in-report';

import type { ReactElement, ReactNode } from 'react';
import type { useAdminCheckInReport } from '@/hooks/queries/use-admin-check-in-report';
import type { AcademicTerm } from '@/types/apps/academic-calendar';
import type { AdminCheckInReportPeriod } from '@/utils/admin-check-in-report';

import ResetAttendanceTermButton from './reset-attendance-term-button';

interface AcademicCheckInReportPageProps {
  period: AdminCheckInReportPeriod;
  report: ReturnType<typeof useAdminCheckInReport>;
  title: string;
  children: ReactNode;
  activityType?: string;
}

const AcademicCheckInReportPage = ({
  period,
  report,
  title,
  children,
  activityType,
}: AcademicCheckInReportPageProps): ReactElement => {
  const { settingsQuery, settings, selectedTerm, weeks, range, handleSelectedTerm } = report;
  const settingsLink: ReactElement = (
    <Button component={Link} href='/apps/calendar' color='inherit' size='small'>
      ปฏิทินการศึกษา
    </Button>
  );
  if (settingsQuery.isPending) return <Spinner />;
  if (settingsQuery.isError) {
    return (
      <Alert
        severity='error'
        action={
          <Button color='inherit' onClick={() => void settingsQuery.refetch()}>
            ลองอีกครั้ง
          </Button>
        }
      >
        ไม่สามารถโหลดภาคเรียนจากปฏิทินการศึกษาได้
      </Alert>
    );
  }
  if (!settings || !weeks.length) {
    return (
      <Alert severity='info' action={settingsLink}>
        กรุณากำหนดภาคเรียนและวันเปิดเทอมในเมนูตั้งค่าระบบก่อนดูรายงาน
      </Alert>
    );
  }
  const termStart: Date = weeks[0].start;
  const termName: string = selectedTerm === 1 ? settings.term1Name : settings.term2Name;
  const periodLabel: string = getAdminCheckInReportPeriodLabel(period, range);
  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }}>
                <BsCalendar2Date />
              </Avatar>
            }
            title={title}
            subheader={`${termName} · วันเปิดเทอม ${formatThaiDate(termStart)}${periodLabel ? ` · ${periodLabel}` : ''}`}
          />
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, px: 5, pt: 5 }}>
            <TextField
              id='admin-checkin-term-select'
              select
              label='ภาคเรียน'
              value={selectedTerm}
              onChange={(event): void => handleSelectedTerm(Number(event.target.value) as AcademicTerm)}
              helperText={`ปีการศึกษา ${settings.academicYear}`}
              sx={{ width: { xs: '100%', sm: 300 } }}
            >
              <MenuItem value={1}>{settings.term1Name}</MenuItem>
              <MenuItem value={2}>{settings.term2Name}</MenuItem>
            </TextField>
            <Typography variant='body2' color='text.secondary'>
              วันเปิดเทอม {formatThaiDate(termStart)} · อ้างอิงปฏิทินการศึกษา
            </Typography>
            {settingsLink}
            <ResetAttendanceTermButton
              academicYear={settings.academicYear}
              term={selectedTerm}
              termName={termName}
              startDate={weeks[0].start}
              endDate={weeks[weeks.length - 1].end}
              activityType={activityType}
            />
          </Box>
          {children}
        </Card>
      </Grid>
    </Grid>
  );
};

export default AcademicCheckInReportPage;
