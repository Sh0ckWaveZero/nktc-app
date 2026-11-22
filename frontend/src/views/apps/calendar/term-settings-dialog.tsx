'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { SchoolOutlined, RestartAlt } from '@mui/icons-material';
import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';

import { formatThaiDate } from '@/@core/utils/thai-calendar';
import { fetchCalendarSettingsForYear } from '@/hooks/queries/useAcademicCalendar';
import type { AcademicCalendarSettings, AcademicTerm } from '@/types/apps/academic-calendar';
import { createEmptyCalendarSettings, getAcademicWeeks, isValidCalendarDate } from '@/utils/academic-calendar';

import { getCalendarErrorMessage } from './calendar-errors';

interface TermSettingsDialogProps {
  initialSettings: AcademicCalendarSettings;
  isSaving: boolean;
  onClose: () => void;
  onSave: (settings: AcademicCalendarSettings) => Promise<void>;
}

const validDate = yup.string().required('กรุณาระบุวันที่').test('date', 'วันที่ไม่ถูกต้อง', (value) =>
  isValidCalendarDate(value || ''),
);

const schema: yup.ObjectSchema<AcademicCalendarSettings> = yup.object({
  academicYear: yup.number().integer().min(544).max(9999).required(),
  selectedTerm: yup.mixed<AcademicTerm>().oneOf([1, 2]).required(),
  term1Start: validDate,
  term2Start: validDate.test('term-order', 'วันเปิดเทอม 2 ต้องหลังวันเปิดเทอม 1', function (value) {
    const term1Start: string = this.parent.term1Start;
    return !value || !isValidCalendarDate(term1Start) || value > term1Start;
  }),
  term1Name: yup.string().trim().required('กรุณาระบุชื่อภาคเรียน').max(100),
  term2Name: yup.string().trim().required('กรุณาระบุชื่อภาคเรียน').max(100),
  startWeekOnMonday: yup.boolean().required(),
});

const TermSettingsDialog = ({ initialSettings, isSaving, onClose, onSave }: TermSettingsDialogProps) => {
  const [yearInput, setYearInput] = useState(String(initialSettings.academicYear));
  const [isLoadingYear, setIsLoadingYear] = useState(false);
  const [isNewYear, setIsNewYear] = useState(!initialSettings.term1Start);
  const savedSettings = useRef(initialSettings);
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<AcademicCalendarSettings>({
    resolver: yupResolver(schema),
    defaultValues: initialSettings,
  });
  const values = useWatch({ control }) as AcademicCalendarSettings;
  const selectedTerm = values.selectedTerm || 1;
  const nameField = selectedTerm === 1 ? 'term1Name' : 'term2Name';
  const selectedStart = selectedTerm === 1 ? values.term1Start : values.term2Start;
  const weeks = isValidCalendarDate(selectedStart || '') ? getAcademicWeeks(values) : [];
  const disabled = isSaving || isLoadingYear;

  const handleLoadYear = async () => {
    const year = Number(yearInput);
    if (!/^\d{4}$/.test(yearInput) || year < 544 || year > 9999) {
      setError('academicYear', { message: 'กรุณาระบุปี พ.ศ. 4 หลักที่ถูกต้อง' });
      return;
    }
    clearErrors('academicYear');
    if (year === getValues('academicYear')) return;

    setIsLoadingYear(true);
    try {
      const settings = await fetchCalendarSettingsForYear(year);
      const next = settings ?? createEmptyCalendarSettings(year);
      savedSettings.current = next;
      setIsNewYear(!settings);
      reset(next);
    } catch (error) {
      setError('academicYear', { message: 'ไม่สามารถโหลดข้อมูลปีการศึกษานี้ได้' });
      toast.error(getCalendarErrorMessage(error, 'ไม่สามารถโหลดข้อมูลปีการศึกษาได้'));
    } finally {
      setIsLoadingYear(false);
    }
  };

  const handleRestore = () => {
    reset(savedSettings.current);
    setYearInput(String(savedSettings.current.academicYear));
  };

  const handleFormSubmit = async (settings: AcademicCalendarSettings) => {
    if (isLoadingYear || yearInput !== String(settings.academicYear)) {
      setError('academicYear', { message: 'กรุณาโหลดข้อมูลปีการศึกษาก่อนบันทึก' });
      return;
    }
    await onSave(settings);
  };

  return (
    <Dialog id='term-settings-dialog' open fullWidth maxWidth='md' onClose={disabled ? undefined : onClose}>
      <DialogTitle>ตั้งค่าวันเปิดภาคเรียนและรอบสัปดาห์</DialogTitle>
      <Box component='form' id='term-settings-form' onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent>
          <Alert severity='info' sx={{ mb: 3 }}>
            กำหนดวันเปิดภาคเรียนทั้งเทอม 1 และเทอม 2 ระบบจะบันทึกข้อมูลแยกตามปีการศึกษาและคำนวณสัปดาห์อัตโนมัติ
            (ปวส. 15 สัปดาห์ และ ปวช. 18 สัปดาห์)
          </Alert>
          <Typography variant='subtitle2' sx={{ mb: 1 }}>
            เลือกภาคเรียนที่ต้องการแสดงผลในปฏิทิน
          </Typography>
          <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 3 }}>
            {([1, 2] as const).map((term) => (
              <Chip
                key={term}
                id={`settings-select-term-${term}`}
                icon={<SchoolOutlined />}
                label={`เทอม ${term}/${values.academicYear}`}
                color={selectedTerm === term ? 'primary' : 'default'}
                variant={selectedTerm === term ? 'filled' : 'outlined'}
                disabled={disabled}
                onClick={() => setValue('selectedTerm', term, { shouldDirty: true })}
              />
            ))}
            <Chip
              id='restore-term-settings'
              icon={<RestartAlt />}
              label='คืนค่าที่บันทึกไว้'
              variant='outlined'
              disabled={disabled}
              onClick={handleRestore}
            />
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id='academic-year-input'
                label='ปีการศึกษา (พ.ศ.)'
                type='number'
                value={yearInput}
                onChange={(event) => setYearInput(event.target.value)}
                onBlur={handleLoadYear}
                error={Boolean(errors.academicYear)}
                helperText={errors.academicYear?.message || (isNewYear ? 'ปีใหม่: กรุณากำหนดวันเปิดทั้งสองเทอม' : 'เปลี่ยนปีเพื่อโหลดข้อมูลที่บันทึกไว้')}
                disabled={disabled}
                fullWidth
                slotProps={{ htmlInput: { min: 544, max: 9999 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='selectedTerm'
                control={control}
                render={({ field }) => (
                  <TextField
                    id='active-term-select'
                    select
                    fullWidth
                    label='ภาคเรียนที่ใช้งานในปฏิทิน'
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    disabled={disabled}
                  >
                    <MenuItem id='active-term-option-1' value={1}>ภาคเรียนที่ 1</MenuItem>
                    <MenuItem id='active-term-option-2' value={2}>ภาคเรียนที่ 2</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('term1Start')}
                id='term-1-start-date'
                label='วันเปิดภาคเรียนที่ 1 (เทอม 1)'
                type='date'
                fullWidth
                required
                disabled={disabled}
                error={Boolean(errors.term1Start)}
                helperText={errors.term1Start?.message || 'สัปดาห์ที่ 1 ของเทอม 1 จะเริ่มนับจากวันนี้'}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('term2Start')}
                id='term-2-start-date'
                label='วันเปิดภาคเรียนที่ 2 (เทอม 2)'
                type='date'
                fullWidth
                required
                disabled={disabled}
                error={Boolean(errors.term2Start)}
                helperText={errors.term2Start?.message || 'สัปดาห์ที่ 1 ของเทอม 2 จะเริ่มนับจากวันนี้'}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                key={nameField}
                {...register(nameField)}
                id='current-term-name'
                label='ชื่อเรียกภาคเรียนปัจจุบัน'
                fullWidth
                required
                disabled={disabled}
                error={Boolean(errors[nameField])}
                helperText={errors[nameField]?.message}
              />
            </Grid>
          </Grid>
          <Controller
            name='startWeekOnMonday'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={{ mt: 2, alignItems: 'flex-start' }}
                control={
                  <Switch
                    id='start-week-on-monday'
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                  />
                }
                label={
                  <Box>
                    <Typography variant='subtitle2'>ปรับให้สัปดาห์เริ่มทุกวันจันทร์ (แนะนำ)</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      ตัดรอบแต่ละสัปดาห์เป็นจันทร์–อาทิตย์ เพื่อความสอดคล้องกับตารางสอน
                    </Typography>
                  </Box>
                }
              />
            )}
          />
          <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              ผลการคำนวณสัปดาห์อัตโนมัติ ({selectedTerm === 1 ? values.term1Name : values.term2Name})
            </Typography>
            {weeks.length ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant='body2' color='text.secondary'>วันเปิดภาคเรียน</Typography>
                  <Typography color='primary.main' sx={{ fontWeight: 700 }}>{formatThaiDate(weeks[0].start)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant='body2' color='text.secondary'>สิ้นสุด ปวส. (15 สัปดาห์)</Typography>
                  <Typography color='primary.main' sx={{ fontWeight: 700 }}>{formatThaiDate(weeks[14].end)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant='body2' color='text.secondary'>สิ้นสุด ปวช. (18 สัปดาห์)</Typography>
                  <Typography color='warning.main' sx={{ fontWeight: 700 }}>{formatThaiDate(weeks[17].end)}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography variant='body2' color='text.secondary'>ระบุวันเปิดภาคเรียนเพื่อดูผลการคำนวณ</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {isLoadingYear && <CircularProgress size={20} aria-label='กำลังโหลดปีการศึกษา' />}
          <Button id='cancel-term-settings' onClick={onClose} disabled={disabled}>ยกเลิก</Button>
          <Button id='save-term-settings' type='submit' variant='contained' disabled={disabled}>
            บันทึกการตั้งค่า
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TermSettingsDialog;
