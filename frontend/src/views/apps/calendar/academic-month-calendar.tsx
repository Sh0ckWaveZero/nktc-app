'use client';

import {
  Add,
  ChevronLeft,
  ChevronRight,
  DeleteOutlined,
  EditOutlined,
  TodayOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { format, isSameDay, isSameMonth, parseISO } from 'date-fns';

import { formatThaiDate, formatThaiYearMonth } from '@/@core/utils/thai-calendar';
import type { AcademicCalendarSettings, CalendarEvent } from '@/types/apps/academic-calendar';
import {
  CALENDAR_EVENT_CATEGORIES,
  eventOccursOnDate,
  getAcademicWeekNumber,
  getAcademicWeeks,
  getCalendarDays,
} from '@/utils/academic-calendar';

interface AcademicMonthCalendarProps {
  month: Date;
  selectedDate: Date;
  today: Date;
  settings: AcademicCalendarSettings | null;
  events: CalendarEvent[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onMonthChange: (offset: number) => void;
  onToday: () => void;
  onSelectDate: (date: Date) => void;
  onAdd: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const AcademicMonthCalendar = ({
  month,
  selectedDate,
  today,
  settings,
  events,
  isLoading,
  hasError,
  onRetry,
  onMonthChange,
  onToday,
  onSelectDate,
  onAdd,
  onEdit,
  onDelete,
}: AcademicMonthCalendarProps) => {
  const days = getCalendarDays(month);
  const weeks = settings ? getAcademicWeeks(settings) : [];
  const selectedEvents = events.filter((event) => eventOccursOnDate(event, selectedDate));
  const termName = settings
    ? settings.selectedTerm === 1 ? settings.term1Name : settings.term2Name
    : 'ยังไม่ได้ตั้งค่าภาคเรียน';

  return (
    <Card>
      <CardContent>
        <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>ปฏิทินการศึกษา</Typography>
            <Typography variant='body2' color='text.secondary'>
              ภาคเรียน: {termName} · ปวส. 15 สัปดาห์ · ปวช. 18 สัปดาห์
            </Typography>
          </Box>
          <Button id='calendar-today-button' size='small' startIcon={<TodayOutlined />} onClick={onToday}>
            กลับไปวันนี้
          </Button>
        </Stack>
        <Box sx={{ maxWidth: 560, mx: 'auto', mt: 4 }}>
          <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{formatThaiYearMonth(month)}</Typography>
            <Box>
              <IconButton id='calendar-previous-month' aria-label='เดือนก่อนหน้า' onClick={() => onMonthChange(-1)}>
                <ChevronLeft />
              </IconButton>
              <IconButton id='calendar-next-month' aria-label='เดือนถัดไป' onClick={() => onMonthChange(1)}>
                <ChevronRight />
              </IconButton>
            </Box>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', textAlign: 'center', gap: 0.5 }}>
            {WEEKDAYS.map((day) => (
              <Typography key={day} variant='caption' color='text.secondary' sx={{ py: 1 }}>
                {day}
              </Typography>
            ))}
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              if (!isSameMonth(day, month)) return <Box key={dateKey} aria-hidden='true' />;
              const week = settings ? getAcademicWeekNumber(settings, day) : null;
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              const isStart = weeks.length > 0 && isSameDay(day, weeks[0].start);
              const isDiplomaEnd = weeks.length > 0 && isSameDay(day, weeks[14].end);
              const isCertificateEnd = weeks.length > 0 && isSameDay(day, weeks[17].end);
              const categories = new Set<CalendarEvent['category']>();
              for (const event of events) {
                if (eventOccursOnDate(event, day)) categories.add(event.category);
              }

              return (
                <Box key={dateKey} sx={{ display: 'flex', justifyContent: 'center', py: 0.25 }}>
                  <Tooltip title={`${formatThaiDate(day)}${week ? ` · สัปดาห์ที่ ${week}` : ''}`}>
                    <Box
                      component='button'
                      id={`calendar-day-${dateKey}`}
                      type='button'
                      aria-label={`${formatThaiDate(day)}${week ? ` สัปดาห์ที่ ${week}` : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => onSelectDate(day)}
                      sx={(theme) => ({
                        width: 46,
                        height: 46,
                        position: 'relative',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        font: 'inherit',
                        color: 'text.primary',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : isStart ? 'success.main' : isCertificateEnd ? 'warning.main' : isDiplomaEnd ? 'info.main' : 'transparent',
                        backgroundColor: week
                          ? alpha(week <= 15 ? theme.palette.info.main : theme.palette.warning.main, 0.1)
                          : 'transparent',
                        fontWeight: isToday || isSelected ? 700 : 400,
                        outline: isToday ? `1px dashed ${theme.palette.text.secondary}` : 'none',
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.16) },
                        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
                      })}
                    >
                      {format(day, 'd')}
                      {week && (
                        <Typography component='span' variant='caption' sx={{ position: 'absolute', top: -4, right: -1, fontSize: 9 }}>
                          {week}
                        </Typography>
                      )}
                      {categories.size > 0 && (
                        <Box sx={{ position: 'absolute', bottom: 3, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '2px' }}>
                          {[...categories].map((category) => (
                            <Box key={category} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: CALENDAR_EVENT_CATEGORIES[category].color }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardContent>
      <Divider />
      <CardContent>
        <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{formatThaiDate(selectedDate, 'EEEEที่ d MMMM yyyy')}</Typography>
          <Button id='add-event-for-selected-date' size='small' variant='outlined' startIcon={<Add />} onClick={onAdd}>
            เพิ่มกิจกรรมวันนี้
          </Button>
        </Stack>
        {isLoading ? (
          <Skeleton variant='rounded' height={60} />
        ) : hasError ? (
          <Alert severity='error' action={<Button id='retry-month-events' onClick={onRetry}>ลองใหม่</Button>}>
            ไม่สามารถโหลดกิจกรรมในปฏิทินได้
          </Alert>
        ) : selectedEvents.length === 0 ? (
          <Typography variant='body2' color='text.secondary'>ไม่มีกิจกรรมในวันที่เลือก</Typography>
        ) : (
          <Stack spacing={1.5}>
            {selectedEvents.map((event) => (
              <Stack key={event.id} direction='row' spacing={1} sx={{ alignItems: 'center', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction='row' spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 600 }}>{event.title}</Typography>
                    <Chip size='small' label={CALENDAR_EVENT_CATEGORIES[event.category].label} sx={{ bgcolor: CALENDAR_EVENT_CATEGORIES[event.category].color, color: 'common.white' }} />
                  </Stack>
                  <Typography variant='caption' color='text.secondary'>
                    {formatThaiDate(parseISO(event.startDate))}
                    {event.endDate !== event.startDate && ` – ${formatThaiDate(parseISO(event.endDate))}`}
                    {event.description && ` · ${event.description}`}
                  </Typography>
                </Box>
                <Tooltip title='แก้ไขกิจกรรม'>
                  <IconButton id={`edit-calendar-event-${event.id}`} aria-label={`แก้ไข ${event.title}`} onClick={() => onEdit(event)}>
                    <EditOutlined fontSize='small' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='ลบกิจกรรม'>
                  <IconButton id={`delete-calendar-event-${event.id}`} aria-label={`ลบ ${event.title}`} color='error' onClick={() => onDelete(event)}>
                    <DeleteOutlined fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademicMonthCalendar;
