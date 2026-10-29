'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import type { CalendarEvent, CalendarEventCategory, CalendarEventInput } from '@/types/apps/academic-calendar';
import { CALENDAR_EVENT_CATEGORIES, isValidCalendarDate } from '@/utils/academic-calendar';

interface CalendarEventDialogProps {
  event: CalendarEvent | null;
  initialDate: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (event: CalendarEventInput) => Promise<void>;
}

const validDate = yup.string().required('กรุณาระบุวันที่').test('date', 'วันที่ไม่ถูกต้อง', (value) =>
  isValidCalendarDate(value || ''),
);

const schema: yup.ObjectSchema<CalendarEventInput> = yup.object({
  title: yup.string().trim().required('กรุณาระบุชื่อกิจกรรม').max(150),
  category: yup.mixed<CalendarEventCategory>().oneOf(['holiday', 'activity', 'exam', 'meeting']).required(),
  startDate: validDate,
  endDate: validDate.test('date-order', 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น', function (value) {
    const startDate: string = this.parent.startDate;
    return !value || !isValidCalendarDate(startDate) || value >= startDate;
  }),
  description: yup.string().trim().max(1000).optional(),
});

const CalendarEventDialog = ({ event, initialDate, isSaving, onClose, onSave }: CalendarEventDialogProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CalendarEventInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: event?.title ?? '',
      category: event?.category ?? 'activity',
      startDate: event?.startDate ?? initialDate,
      endDate: event?.endDate ?? initialDate,
      description: event?.description ?? '',
    },
  });

  return (
    <Dialog id='calendar-event-dialog' open fullWidth maxWidth='sm' onClose={isSaving ? undefined : onClose}>
      <DialogTitle>{event ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'}</DialogTitle>
      <Box component='form' id='calendar-event-form' onSubmit={handleSubmit(onSave)} noValidate>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid size={12}>
              <TextField
                {...register('title')}
                id='calendar-event-title'
                label='ชื่อกิจกรรม'
                fullWidth
                required
                disabled={isSaving}
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name='category'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id='calendar-event-category'
                    label='ประเภท'
                    select
                    fullWidth
                    disabled={isSaving}
                  >
                    {Object.entries(CALENDAR_EVENT_CATEGORIES).map(([category, option]) => (
                      <MenuItem key={category} id={`calendar-event-category-${category}`} value={category}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('startDate')}
                id='calendar-event-start-date'
                label='วันเริ่มต้น'
                type='date'
                fullWidth
                required
                disabled={isSaving}
                error={Boolean(errors.startDate)}
                helperText={errors.startDate?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('endDate')}
                id='calendar-event-end-date'
                label='วันสิ้นสุด'
                type='date'
                fullWidth
                required
                disabled={isSaving}
                error={Boolean(errors.endDate)}
                helperText={errors.endDate?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('description')}
                id='calendar-event-description'
                label='รายละเอียด'
                multiline
                minRows={2}
                fullWidth
                disabled={isSaving}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button id='cancel-calendar-event' onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
          <Button id='save-calendar-event' type='submit' variant='contained' disabled={isSaving}>บันทึกกิจกรรม</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CalendarEventDialog;
