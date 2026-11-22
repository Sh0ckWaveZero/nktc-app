'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Add, CalendarMonthOutlined, CheckCircleOutlined, HistoryOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { parseISO } from 'date-fns';
import { toast } from 'react-toastify';

import Spinner from '@/@core/components/spinner';
import { formatThaiDate } from '@/@core/utils/thai-calendar';
import { useAcademicYear } from '@/context/academic-year-context';
import {
  useAcademicYearsManagement,
  useActivateAcademicYear,
  useCreateAcademicYear,
} from '@/hooks/queries/use-academic-years';
import { useSaveAcademicCalendarSettings } from '@/hooks/queries/useAcademicCalendar';
import { getCalendarErrorMessage } from '@/views/apps/calendar/calendar-errors';
import TermSettingsDialog from '@/views/apps/calendar/term-settings-dialog';
import type { ReactElement } from 'react';
import type { AcademicCalendarSettings } from '@/types/apps/academic-calendar';
import type { AcademicYear, AcademicYearCounts } from '@/types/apps/academic-year';

import ActivateAcademicYearDialog from './activate-academic-year-dialog';
import CreateAcademicYearDialog from './create-academic-year-dialog';

type YearDialog =
  | { type: 'create' }
  | { type: 'activate'; year: AcademicYear }
  | { type: 'edit'; settings: AcademicCalendarSettings }
  | null;
const STATUS_LABELS: Record<AcademicYear['status'], string> = {
  active: 'กำลังใช้งาน',
  draft: 'รอเปิดใช้',
  archived: 'ย้อนหลัง',
};
const COUNT_LABELS: Record<keyof AcademicYearCounts, string> = {
  attendance: 'เช็คชื่อหน้าเสาธง',
  activities: 'เช็คชื่อกิจกรรม',
  visits: 'เยี่ยมบ้าน',
  goodness: 'ความดี',
  badness: 'พฤติกรรม',
  events: 'ปฏิทิน',
};

const AcademicYearPage = (): ReactElement => {
  const management = useAcademicYearsManagement();
  const scope = useAcademicYear();
  const createYear = useCreateAcademicYear();
  const activateYear = useActivateAcademicYear();
  const saveCalendar = useSaveAcademicCalendarSettings();
  const [dialog, setDialog] = useState<YearDialog>(null);
  const handleCreate = async (input: AcademicCalendarSettings): Promise<void> => {
    try {
      await createYear.mutateAsync(input);
      setDialog(null);
      toast.success(`เพิ่มปี ${input.academicYear} แล้ว กรุณาตรวจสอบและยืนยันเปิดใช้`);
    } catch (error) {
      toast.error(getCalendarErrorMessage(error, 'เพิ่มปีการศึกษาไม่สำเร็จ'));
    }
  };
  const handleActivate = async (): Promise<void> => {
    if (dialog?.type !== 'activate' || !management.data) return;
    try {
      await activateYear.mutateAsync({
        academicYear: dialog.year.academicYear,
        expectedVersion: management.data.version,
      });
      scope.selectYear(null);
      toast.success(`เปิดใช้ปีการศึกษา ${dialog.year.academicYear} แล้ว`);
      setDialog(null);
      await scope.refresh();
    } catch (error) {
      toast.error(getCalendarErrorMessage(error, 'เปิดปีการศึกษาไม่สำเร็จ'));
      await management.refetch();
    }
  };
  const handleSaveCalendar = async (settings: AcademicCalendarSettings): Promise<void> => {
    try {
      await saveCalendar.mutateAsync(settings);
      setDialog(null);
      await management.refetch();
      toast.success('บันทึกวันเปิดภาคเรียนแล้ว');
    } catch (error) {
      toast.error(getCalendarErrorMessage(error, 'บันทึกวันเปิดภาคเรียนไม่สำเร็จ'));
    }
  };
  if (management.isPending) return <Spinner />;
  if (management.isError)
    return (
      <Alert
        severity='error'
        action={
          <Button
            onClick={(): void => {
              void management.refetch();
            }}
          >
            ลองอีกครั้ง
          </Button>
        }
      >
        โหลดข้อมูลปีการศึกษาไม่สำเร็จ
      </Alert>
    );
  const { activeAcademicYear, years } = management.data;
  const suggestedYear = Math.max(activeAcademicYear, ...years.map((year) => year.academicYear)) + 1;
  return (
    <Stack spacing={5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Box>
          <Typography variant='h4'>ปีการศึกษา</Typography>
          <Typography color='text.secondary'>จัดการปีที่ใช้งาน พร้อมเก็บบันทึกปีเดิมสำหรับดูย้อนหลัง</Typography>
        </Box>
        <Button variant='contained' startIcon={<Add />} onClick={(): void => setDialog({ type: 'create' })}>
          เพิ่มปีการศึกษา
        </Button>
      </Stack>
      <Alert severity='info'>
        ปีที่ทั้งระบบใช้งาน: <strong>{activeAcademicYear}</strong> · รายชื่อนักเรียน ครู แผนก และห้องเรียนใช้ร่วมกัน
        ส่วนเช็คชื่อ กิจกรรม เยี่ยมบ้าน และคะแนนแยกตามปี
      </Alert>
      {years.map((year) => (
        <Card
          key={year.academicYear}
          sx={{ border: 1, borderColor: year.status === 'active' ? 'primary.main' : 'divider' }}
        >
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ justifyContent: 'space-between' }}>
              <Stack direction='row' spacing={3} sx={{ alignItems: 'center' }}>
                <Typography variant='h5'>ปีการศึกษา {year.academicYear}</Typography>
                <Chip
                  label={STATUS_LABELS[year.status]}
                  size='small'
                  color={year.status === 'active' ? 'success' : year.status === 'draft' ? 'warning' : 'default'}
                />
              </Stack>
              <Stack direction='row' spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {year.status === 'draft' ? (
                  <Button
                    variant='contained'
                    startIcon={<CheckCircleOutlined />}
                    onClick={(): void => setDialog({ type: 'activate', year })}
                  >
                    ยืนยันเปิดใช้ปี {year.academicYear}
                  </Button>
                ) : (
                  <Button
                    variant='outlined'
                    startIcon={<HistoryOutlined />}
                    onClick={(): void => scope.selectYear(year.status === 'active' ? null : year.academicYear)}
                    disabled={scope.academicYear === year.academicYear}
                  >
                    {scope.academicYear === year.academicYear ? 'กำลังดูปีนี้' : 'ดูข้อมูลปีนี้'}
                  </Button>
                )}
                {year.calendar && year.status !== 'archived' && !scope.isHistorical && (
                  <Button
                    startIcon={<CalendarMonthOutlined />}
                    onClick={(): void => {
                      if (year.calendar) setDialog({ type: 'edit', settings: year.calendar });
                    }}
                  >
                    แก้ไขวันเปิดเทอม
                  </Button>
                )}
              </Stack>
            </Stack>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {([1, 2] as const).map((term) => (
                <Grid size={{ xs: 12, sm: 6 }} key={term}>
                  <Typography variant='body2' color='text.secondary'>
                    วันเปิดภาคเรียนที่ {term}
                  </Typography>
                  <Typography>
                    {year.calendar
                      ? formatThaiDate(parseISO(term === 1 ? year.calendar.term1Start : year.calendar.term2Start))
                      : 'ยังไม่มีข้อมูลปฏิทินของปีนี้'}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 4 }} />
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              จำนวนบันทึกในปีนี้
            </Typography>
            <Stack direction='row' spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {(Object.keys(COUNT_LABELS) as (keyof AcademicYearCounts)[]).map((key) => (
                <Chip
                  key={key}
                  variant='outlined'
                  label={`${COUNT_LABELS[key]} ${year.counts[key].toLocaleString('th-TH')} รายการ`}
                />
              ))}
            </Stack>
            {year.status === 'draft' && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 3 }}>
                ตรวจสอบวันเปิดเทอมก่อนยืนยัน ปีที่ใช้งานจะเปลี่ยนเมื่อกดยืนยันเท่านั้น
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
      <Button
        component={Link}
        href='/apps/calendar'
        startIcon={<CalendarMonthOutlined />}
        sx={{ alignSelf: 'flex-start' }}
      >
        ไปปฏิทินการศึกษา
      </Button>
      {dialog?.type === 'create' && (
        <CreateAcademicYearDialog
          activeAcademicYear={activeAcademicYear}
          suggestedYear={suggestedYear}
          isSaving={createYear.isPending}
          onClose={(): void => setDialog(null)}
          onSave={handleCreate}
        />
      )}
      {dialog?.type === 'activate' && (
        <ActivateAcademicYearDialog
          academicYear={dialog.year.academicYear}
          activeAcademicYear={activeAcademicYear}
          isSaving={activateYear.isPending}
          onClose={(): void => setDialog(null)}
          onConfirm={handleActivate}
        />
      )}
      {dialog?.type === 'edit' && (
        <TermSettingsDialog
          initialSettings={dialog.settings}
          isSaving={saveCalendar.isPending}
          onClose={(): void => setDialog(null)}
          onSave={handleSaveCalendar}
        />
      )}
    </Stack>
  );
};

export default AcademicYearPage;
