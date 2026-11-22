'use client';

import { CalendarMonthOutlined, EventAvailableOutlined, HelpOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { parseISO } from 'date-fns';

import { formatThaiDate } from '@/@core/utils/thai-calendar';
import type { CalendarEvent } from '@/types/apps/academic-calendar';
import { CALENDAR_EVENT_CATEGORIES } from '@/utils/academic-calendar';

interface CalendarSidebarProps {
  today: Date;
  todayState: EventListState;
  upcomingState: EventListState;
  onSelectDate: (date: Date) => void;
}

type EventListState =
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void }
  | { status: 'success'; events: CalendarEvent[] };

const LEGEND = [
  { color: '#4caf50', label: 'วันเปิดภาคเรียน (เริ่มสัปดาห์ที่ 1)', outlined: true },
  { color: '#dceefc', label: 'สัปดาห์ที่ 1–15: ปวช. และ ปวส. เรียนร่วมกัน' },
  { color: '#16a7ed', label: 'สัปดาห์ที่ 15: สิ้นสุดการเรียน ปวส.', outlined: true },
  { color: '#ffead2', label: 'สัปดาห์ที่ 16–18: เฉพาะ ปวช. เรียน' },
  { color: '#f5a400', label: 'สัปดาห์ที่ 18: สิ้นสุดการเรียน ปวช.', outlined: true },
];

const CalendarSidebar = ({
  today,
  todayState,
  upcomingState,
  onSelectDate,
}: CalendarSidebarProps) => {
  const renderEvents = (events: CalendarEvent[], emptyText: string, section: 'today' | 'upcoming') => (
    events.length === 0 ? (
      <Typography variant='body2' color='text.secondary'>{emptyText}</Typography>
    ) : (
      <Stack spacing={1.5}>
        {events.map((event) => (
          <Button
            key={event.id}
            id={`sidebar-event-${event.id}-${section}`}
            onClick={() => onSelectDate(parseISO(event.startDate))}
            sx={{ justifyContent: 'flex-start', textAlign: 'left', px: 0, textTransform: 'none' }}
          >
            <Box>
              <Stack direction='row' spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip size='small' label={CALENDAR_EVENT_CATEGORIES[event.category].label} sx={{ bgcolor: CALENDAR_EVENT_CATEGORIES[event.category].color, color: 'common.white' }} />
                <Typography variant='body2' color='text.primary' sx={{ fontWeight: 600 }}>{event.title}</Typography>
              </Stack>
              <Typography variant='caption' color='text.secondary'>{formatThaiDate(parseISO(event.startDate))}</Typography>
            </Box>
          </Button>
        ))}
      </Stack>
    )
  );

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <HelpOutlined fontSize='small' />
            <Typography variant='h6' sx={{ fontWeight: 700 }}>สัญลักษณ์และระดับชั้น</Typography>
          </Stack>
          <Stack spacing={1}>
            {LEGEND.map((item) => (
              <Stack key={item.label} direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 13, height: 13, flexShrink: 0, borderRadius: '3px', border: 2, borderColor: item.color, bgcolor: item.outlined ? 'transparent' : item.color }} />
                <Typography variant='body2'>{item.label}</Typography>
              </Stack>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {Object.entries(CALENDAR_EVENT_CATEGORIES).map(([category, option]) => (
              <Chip key={category} size='small' label={option.label} sx={{ bgcolor: option.color, color: 'common.white' }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack direction='row' spacing={1} sx={{ alignItems: 'flex-start', mb: 2 }}>
            <EventAvailableOutlined fontSize='small' />
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>กิจกรรมวันนี้</Typography>
              <Typography variant='body2' color='text.secondary'>{formatThaiDate(today)}</Typography>
            </Box>
          </Stack>
          {todayState.status === 'loading' ? <Skeleton height={45} /> : todayState.status === 'error' ? (
            <Alert severity='error' action={<Button id='retry-today-events' onClick={todayState.onRetry}>ลองใหม่</Button>}>โหลดกิจกรรมวันนี้ไม่สำเร็จ</Alert>
          ) : renderEvents(todayState.events, 'ไม่มีกิจกรรมวันนี้', 'today')}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <CalendarMonthOutlined fontSize='small' />
            <Typography variant='h6' sx={{ fontWeight: 700 }}>กิจกรรมที่กำลังจะมาถึง</Typography>
          </Stack>
          {upcomingState.status === 'loading' ? <Skeleton height={45} /> : upcomingState.status === 'error' ? (
            <Alert severity='error' action={<Button id='retry-upcoming-events' onClick={upcomingState.onRetry}>ลองใหม่</Button>}>โหลดกิจกรรมที่กำลังจะมาถึงไม่สำเร็จ</Alert>
          ) : renderEvents(upcomingState.events, 'ไม่มีกิจกรรมที่กำลังจะมาถึง', 'upcoming')}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CalendarSidebar;
