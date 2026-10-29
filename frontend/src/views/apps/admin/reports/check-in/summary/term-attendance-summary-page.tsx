'use client';

import { AssessmentOutlined } from '@mui/icons-material';
import { Alert, Avatar, Button, Card, CardHeader, Skeleton, Stack } from '@mui/material';
import Link from 'next/link';

import { useAttendanceSummary } from '@/hooks/use-attendance-summary';

import type { ReactElement } from 'react';

import AttendanceSummaryDashboard from './attendance-summary-dashboard';
import AttendanceSummaryFilters from './attendance-summary-filters';

const TermAttendanceSummaryPage = (): ReactElement => {
  const state: ReturnType<typeof useAttendanceSummary> = useAttendanceSummary();
  const { optionsQuery, summaryQuery } = state;
  if (optionsQuery.isPending) return <Skeleton variant='rounded' height={240} aria-label='กำลังโหลดปีการศึกษา' />;
  if (optionsQuery.isError) {
    return (
      <Alert
        severity='error'
        action={
          <Button
            color='inherit'
            onClick={(): void => {
              void optionsQuery.refetch();
            }}
          >
            ลองอีกครั้ง
          </Button>
        }
      >
        ไม่สามารถโหลดปีการศึกษาจากปฏิทินได้
      </Alert>
    );
  }
  if (!state.years.length) {
    return (
      <Alert
        severity='info'
        action={
          <Button component={Link} href='/apps/calendar' color='inherit'>
            ตั้งค่าปฏิทินการศึกษา
          </Button>
        }
      >
        กรุณาตั้งค่าปีการศึกษาและวันเปิดเทอมก่อนดูสรุปสถิติ
      </Alert>
    );
  }
  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AssessmentOutlined />
            </Avatar>
          }
          title='สรุปสถิติหน้าเสาธงรายภาคเรียน'
          subheader='ดูภาพรวมการมาตรงเวลา สถานะการเช็คชื่อ และแนวโน้มของนักเรียนจากข้อมูลที่บันทึกจริง'
        />
      </Card>
      <AttendanceSummaryFilters state={state} />
      {summaryQuery.isPending ? (
        <Skeleton variant='rounded' height={400} aria-label='กำลังคำนวณสถิติรายภาคเรียน' />
      ) : summaryQuery.isError ? (
        <Alert
          severity='error'
          action={
            <Button
              color='inherit'
              onClick={(): void => {
                void summaryQuery.refetch();
              }}
            >
              ลองอีกครั้ง
            </Button>
          }
        >
          ไม่สามารถโหลดสรุปสถิติของภาคเรียนนี้ได้
        </Alert>
      ) : (
        <AttendanceSummaryDashboard key={`${state.academicYear}-${state.selectedTerm}`} data={summaryQuery.data} />
      )}
    </Stack>
  );
};

export default TermAttendanceSummaryPage;
