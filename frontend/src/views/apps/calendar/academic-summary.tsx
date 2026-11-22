'use client';

import { CalendarMonthOutlined, SettingsOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { parseISO } from 'date-fns';

import { formatThaiDate } from '@/@core/utils/thai-calendar';
import type { AcademicCalendarSettings, AcademicTerm } from '@/types/apps/academic-calendar';
import { getAcademicProgress, getAcademicWeekNumber, getAcademicWeeks, getTermStart } from '@/utils/academic-calendar';

interface AcademicSummaryProps {
  settings: AcademicCalendarSettings | null;
  today: Date;
  isSaving: boolean;
  onOpenSettings: () => void;
  onSelectTerm: (term: AcademicTerm) => void;
}

const AcademicSummary = ({ settings, today, isSaving, onOpenSettings, onSelectTerm }: AcademicSummaryProps) => {
  const weeks = settings ? getAcademicWeeks(settings) : [];
  const currentWeek = settings ? getAcademicWeekNumber(settings, today) : null;
  const progress = settings ? getAcademicProgress(settings, today) : 0;
  const activeName = settings
    ? settings.selectedTerm === 1 ? settings.term1Name : settings.term2Name
    : 'ยังไม่ได้ตั้งค่าภาคเรียน';
  const activeStart = settings ? getTermStart(settings) : null;
  const outsideMessage = !settings
    ? 'กรุณากำหนดวันเปิดภาคเรียน'
    : today < weeks[0].start
      ? 'ยังไม่ถึงวันเปิดภาคเรียน'
      : 'สิ้นสุดภาคเรียนแล้ว';

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant='subtitle2'>วันเปิดภาคเรียน</Typography>
              <Chip size='small' variant='outlined' color='primary' icon={<CalendarMonthOutlined />} label={activeName} />
            </Stack>
            <Stack direction='row' spacing={1}>
              {([1, 2] as const).map((term) => (
                <Chip
                  key={term}
                  id={`calendar-switch-term-${term}`}
                  label={`เทอม ${term}`}
                  size='small'
                  color={settings?.selectedTerm === term ? 'primary' : 'default'}
                  variant={settings?.selectedTerm === term ? 'filled' : 'outlined'}
                  disabled={!settings || isSaving}
                  onClick={() => onSelectTerm(term)}
                />
              ))}
            </Stack>
            <Typography variant='h5' color='primary.main' sx={{ fontWeight: 700 }}>
              {activeStart ? formatThaiDate(activeStart) : 'ยังไม่กำหนด'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {activeStart ? 'เริ่มสัปดาห์ที่ 1 ของภาคเรียน' : 'ตั้งค่าเพื่อแสดงสัปดาห์การเรียน'}
            </Typography>
            {settings && (
              <Typography variant='caption' color='text.secondary'>
                {settings.selectedTerm === 1 ? 'เทอม 2' : 'เทอม 1'} เริ่ม: {formatThaiDate(parseISO(
                  settings.selectedTerm === 1 ? settings.term2Start : settings.term1Start,
                ))}
              </Typography>
            )}
            <Button
              id='summary-open-term-settings'
              variant='outlined'
              size='small'
              startIcon={<SettingsOutlined />}
              onClick={onOpenSettings}
              sx={{ mt: 'auto' }}
            >
              ตั้งค่าวันเปิดเทอม
            </Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'info.main' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle2'>ระดับ ปวส. (15 สัปดาห์)</Typography>
              <Chip size='small' color='info' label='15 สัปดาห์' />
            </Stack>
            <Typography variant='h5' color='info.main' sx={{ fontWeight: 700 }}>
              {weeks.length ? formatThaiDate(weeks[14].end) : 'ยังไม่กำหนด'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>สิ้นสุดการเรียน / สอบปลายภาค ปวส.</Typography>
            <Chip
              size='small'
              variant='outlined'
              label={currentWeek && currentWeek <= 15 ? `กำลังเรียนสัปดาห์ที่ ${currentWeek}` : 'อยู่นอกช่วงภาคเรียน'}
              sx={{ mt: 'auto' }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'warning.main' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='subtitle2'>ระดับ ปวช. (18 สัปดาห์)</Typography>
              <Chip size='small' color='warning' label='18 สัปดาห์' />
            </Stack>
            <Typography variant='h5' color='warning.main' sx={{ fontWeight: 700 }}>
              {weeks.length ? formatThaiDate(weeks[17].end) : 'ยังไม่กำหนด'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>สิ้นสุดการเรียน / สอบปลายภาค ปวช.</Typography>
            <Chip
              size='small'
              variant='outlined'
              label={currentWeek ? `กำลังเรียนสัปดาห์ที่ ${currentWeek}` : 'อยู่นอกช่วงภาคเรียน'}
              sx={{ mt: 'auto' }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card sx={{ height: '100%', borderLeft: 4, borderColor: 'success.main' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant='subtitle2'>สถานะสัปดาห์ปัจจุบัน</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              {currentWeek ? `สัปดาห์ที่ ${currentWeek}` : 'อยู่นอกภาคเรียน'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {currentWeek ? (currentWeek <= 15 ? 'ปวส. และ ปวช. เรียนร่วมกัน' : 'เฉพาะ ปวช. ที่ยังเรียน') : outsideMessage}
            </Typography>
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
                <Typography variant='caption'>ความคืบหน้าภาคเรียน</Typography>
                <Typography variant='caption' sx={{ fontWeight: 700 }}>{progress}%</Typography>
              </Stack>
              <LinearProgress variant='determinate' value={progress} sx={{ mt: 0.5, borderRadius: 2 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AcademicSummary;
