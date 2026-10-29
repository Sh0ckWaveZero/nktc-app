'use client';

import { Add, CalendarMonthOutlined, SettingsOutlined, ViewWeekOutlined } from '@mui/icons-material';
import {
  Alert,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Skeleton,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { addDays, addMonths, format, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { getThaiYear } from '@/@core/utils/thai-calendar';
import {
  useAcademicCalendarSettings,
  useCalendarEvents,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useSaveAcademicCalendarSettings,
  useUpdateCalendarEvent,
} from '@/hooks/queries/useAcademicCalendar';
import type {
  AcademicCalendarSettings,
  AcademicTerm,
  CalendarEvent,
  CalendarEventInput,
} from '@/types/apps/academic-calendar';
import { createEmptyCalendarSettings, getCalendarDays, getTermStart } from '@/utils/academic-calendar';

import AcademicMonthCalendar from './academic-month-calendar';
import AcademicSummary from './academic-summary';
import AcademicWeeksTable from './academic-weeks-table';
import { getCalendarErrorMessage } from './calendar-errors';
import CalendarEventDialog from './calendar-event-dialog';
import CalendarSidebar from './calendar-sidebar';
import TermSettingsDialog from './term-settings-dialog';

type CalendarDialog =
  | { type: 'settings' }
  | { type: 'event'; event: CalendarEvent | null }
  | { type: 'delete'; event: CalendarEvent }
  | null;

const AcademicCalendarPage = () => {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  const [navigation, setNavigation] = useState<{ month: Date; selectedDate: Date } | null>(null);
  const [tab, setTab] = useState(0);
  const [dialog, setDialog] = useState<CalendarDialog>(null);

  const settingsQuery = useAcademicCalendarSettings();
  const settings = settingsQuery.data ?? null;
  const defaultDate = settings ? getTermStart(settings) : today;
  const displayedMonth = navigation?.month ?? defaultDate;
  const displayedDate = navigation?.selectedDate ?? defaultDate;
  const days = getCalendarDays(displayedMonth);
  const todayKey = format(today, 'yyyy-MM-dd');
  const monthEvents = useCalendarEvents({
    from: format(days[0], 'yyyy-MM-dd'),
    to: format(days[days.length - 1], 'yyyy-MM-dd'),
  });
  const todayEvents = useCalendarEvents({ from: todayKey, to: todayKey });
  const upcomingEvents = useCalendarEvents({ startsFrom: format(addDays(today, 1), 'yyyy-MM-dd'), limit: 5 });
  const saveSettings = useSaveAcademicCalendarSettings();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const isEventSaving = createEvent.isPending || updateEvent.isPending;

  useEffect(() => {
    const timer = window.setInterval(() => setToday(startOfDay(new Date())), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const selectDate = (date: Date) => {
    setNavigation({ month: date, selectedDate: date });
    setTab(0);
  };

  const handleSaveSettings = async (next: AcademicCalendarSettings) => {
    try {
      const saved = await saveSettings.mutateAsync(next);
      if (settings?.academicYear === saved.academicYear) selectDate(getTermStart(saved));
      setDialog(null);
      toast.success(settings?.academicYear === saved.academicYear
        ? 'บันทึกการตั้งค่าภาคเรียนเรียบร้อยแล้ว'
        : 'บันทึกปฏิทินปีใหม่แล้ว ยืนยันเปิดใช้ได้ที่เมนูตั้งค่าระบบ > ปีการศึกษา');
    } catch (error) {
      toast.error(getCalendarErrorMessage(error, 'ไม่สามารถบันทึกการตั้งค่าภาคเรียนได้'));
    }
  };

  const handleSelectTerm = async (term: AcademicTerm) => {
    if (!settings || settings.selectedTerm === term) return;
    try {
      const saved = await saveSettings.mutateAsync({ ...settings, selectedTerm: term });
      selectDate(getTermStart(saved));
    } catch (error) {
      toast.error(getCalendarErrorMessage(error, 'ไม่สามารถเปลี่ยนภาคเรียนได้'));
    }
  };

  const handleOpenEvent = (event: CalendarEvent | null = null) => {
    setDialog({ type: 'event', event });
  };

  const handleSaveEvent = async (event: CalendarEventInput) => {
    const editingEvent = dialog?.type === 'event' ? dialog.event : null;
    try {
      const saved = editingEvent
        ? await updateEvent.mutateAsync({ id: editingEvent.id, event })
        : await createEvent.mutateAsync(event);
      selectDate(parseISO(saved.startDate));
      setDialog(null);
      toast.success(editingEvent ? 'แก้ไขกิจกรรมเรียบร้อยแล้ว' : 'เพิ่มกิจกรรมเรียบร้อยแล้ว');
    } catch (error) {
      toast.error(getCalendarErrorMessage(error, 'ไม่สามารถบันทึกกิจกรรมได้'));
    }
  };

  const handleDeleteEvent = async () => {
    if (dialog?.type !== 'delete') return;
    try {
      await deleteEvent.mutateAsync(dialog.event.id);
      setDialog(null);
      toast.success('ลบกิจกรรมเรียบร้อยแล้ว');
    } catch (error) {
      toast.error(getCalendarErrorMessage(error, 'ไม่สามารถลบกิจกรรมได้'));
    }
  };

  if (settingsQuery.isPending) return <Skeleton variant='rounded' height={280} />;
  if (settingsQuery.isError) {
    return (
      <Alert severity='error' action={<Button id='retry-calendar-settings' onClick={() => settingsQuery.refetch()}>ลองใหม่</Button>}>
        ไม่สามารถโหลดการตั้งค่าปฏิทินได้
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <AcademicSummary
        settings={settings}
        today={today}
        isSaving={saveSettings.isPending}
        onOpenSettings={() => setDialog({ type: 'settings' })}
        onSelectTerm={handleSelectTerm}
      />
      {!settings && (
        <Alert severity='info'>ยังไม่ได้ตั้งค่าภาคเรียน กรุณากำหนดวันเปิดเทอม 1 และเทอม 2 เพื่อแสดงสัปดาห์การเรียน</Alert>
      )}
      <Card sx={{ px: 2, py: 1 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { lg: 'center' }, gap: 1 }}>
          <Tabs id='academic-calendar-tabs' value={tab} onChange={(_, value: number) => setTab(value)} variant='scrollable' scrollButtons='auto' aria-label='มุมมองปฏิทินการศึกษา'>
            <Tab id='academic-calendar-tab' icon={<CalendarMonthOutlined />} iconPosition='start' label='ปฏิทินการศึกษาและมาร์กสัปดาห์' />
            <Tab id='academic-weeks-tab' icon={<ViewWeekOutlined />} iconPosition='start' label='ตารางแจกแจง 18 สัปดาห์ (ปวส. 15 / ปวช. 18)' />
          </Tabs>
          <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap', pb: { xs: 1, lg: 0 } }}>
            <Button id='open-term-settings' variant='outlined' startIcon={<SettingsOutlined />} onClick={() => setDialog({ type: 'settings' })}>
              กำหนดวันเปิดเทอม
            </Button>
            <Button id='add-calendar-event' variant='contained' startIcon={<Add />} onClick={() => handleOpenEvent()}>
              เพิ่มกิจกรรม
            </Button>
          </Stack>
        </Stack>
      </Card>
      {tab === 0 ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <AcademicMonthCalendar
              month={displayedMonth}
              selectedDate={displayedDate}
              today={today}
              settings={settings}
              events={monthEvents.data ?? []}
              isLoading={monthEvents.isPending}
              hasError={monthEvents.isError}
              onRetry={() => monthEvents.refetch()}
              onMonthChange={(offset) => selectDate(startOfMonth(addMonths(displayedMonth, offset)))}
              onToday={() => selectDate(today)}
              onSelectDate={(date) => setNavigation({ month: displayedMonth, selectedDate: date })}
              onAdd={() => handleOpenEvent()}
              onEdit={handleOpenEvent}
              onDelete={(event) => setDialog({ type: 'delete', event })}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <CalendarSidebar
              today={today}
              todayState={todayEvents.isPending
                ? { status: 'loading' }
                : todayEvents.isError
                  ? { status: 'error', onRetry: () => todayEvents.refetch() }
                  : { status: 'success', events: todayEvents.data }}
              upcomingState={upcomingEvents.isPending
                ? { status: 'loading' }
                : upcomingEvents.isError
                  ? { status: 'error', onRetry: () => upcomingEvents.refetch() }
                  : { status: 'success', events: upcomingEvents.data }}
              onSelectDate={selectDate}
            />
          </Grid>
        </Grid>
      ) : (
        <AcademicWeeksTable settings={settings} today={today} />
      )}
      {dialog?.type === 'settings' && (
        <TermSettingsDialog
          initialSettings={settings ?? createEmptyCalendarSettings(getThaiYear(today))}
          isSaving={saveSettings.isPending}
          onClose={() => setDialog(null)}
          onSave={handleSaveSettings}
        />
      )}
      {dialog?.type === 'event' && (
        <CalendarEventDialog
          event={dialog.event}
          initialDate={format(displayedDate, 'yyyy-MM-dd')}
          isSaving={isEventSaving}
          onClose={() => setDialog(null)}
          onSave={handleSaveEvent}
        />
      )}
      {dialog?.type === 'delete' && (
        <Dialog
          id='delete-calendar-event-dialog'
          open
          onClose={deleteEvent.isPending ? undefined : () => setDialog(null)}
        >
          <DialogTitle>ยืนยันการลบกิจกรรม</DialogTitle>
          <DialogContent>
            <DialogContentText>คุณต้องการลบกิจกรรม “{dialog.event.title}” ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button id='cancel-delete-calendar-event' disabled={deleteEvent.isPending} onClick={() => setDialog(null)}>ยกเลิก</Button>
            <Button id='confirm-delete-calendar-event' color='error' variant='contained' disabled={deleteEvent.isPending} onClick={handleDeleteEvent}>ลบกิจกรรม</Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
};

export default AcademicCalendarPage;
