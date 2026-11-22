'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { isValidCalendarDate } from '@/utils/academic-calendar';
import type { ReactElement } from 'react';
import type { AcademicCalendarSettings } from '@/types/apps/academic-calendar';

interface CreateAcademicYearDialogProps {
  activeAcademicYear: number;
  suggestedYear: number;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: AcademicCalendarSettings) => Promise<void>;
}

interface NewYearInput {
  academicYear: number;
  term1Start: string;
  term2Start: string;
}

const validDate = yup
  .string()
  .required('กรุณาระบุวันเปิดภาคเรียน')
  .test('date', 'วันที่ไม่ถูกต้อง', (value) => isValidCalendarDate(value || ''));

const CreateAcademicYearDialog = ({
  activeAcademicYear,
  suggestedYear,
  isSaving,
  onClose,
  onSave,
}: CreateAcademicYearDialogProps): ReactElement => {
  const schema: yup.ObjectSchema<NewYearInput> = yup.object({
    academicYear: yup
      .number()
      .typeError('กรุณากรอกปี พ.ศ.')
      .integer()
      .min(activeAcademicYear + 1, 'ต้องมากกว่าปีที่ใช้งาน')
      .max(9999)
      .required(),
    term1Start: validDate.test('year', 'วันเปิดเทอม 1 ต้องอยู่ในปี พ.ศ. ที่ระบุ', function (value) {
      const year: number = this.parent.academicYear;
      return !value || Number(value.slice(0, 4)) === year - 543;
    }),
    term2Start: validDate.test('order', 'วันเปิดเทอม 2 ต้องหลังเทอม 1 และไม่เกินปีถัดไป', function (value) {
      const input: NewYearInput = this.parent;
      return (
        !value ||
        !input.term1Start ||
        (value > input.term1Start && Number(value.slice(0, 4)) <= input.academicYear - 542)
      );
    }),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewYearInput>({
    resolver: yupResolver(schema),
    defaultValues: { academicYear: suggestedYear, term1Start: '', term2Start: '' },
  });
  const handleSave = async (input: NewYearInput): Promise<void> =>
    onSave({
      ...input,
      selectedTerm: 1,
      term1Name: `ภาคเรียนที่ 1/${input.academicYear}`,
      term2Name: `ภาคเรียนที่ 2/${input.academicYear}`,
      startWeekOnMonday: true,
    });
  return (
    <Dialog open fullWidth maxWidth='sm' onClose={isSaving ? undefined : onClose}>
      <DialogTitle>เพิ่มปีการศึกษาใหม่</DialogTitle>
      <Box component='form' onSubmit={handleSubmit(handleSave)} noValidate>
        <DialogContent>
          <Stack spacing={4}>
            <Alert severity='info'>กำหนดวันเปิดทั้งสองภาคเรียน ข้อมูลนี้จะใช้ร่วมกับปฏิทินการศึกษาและรายงาน</Alert>
            <TextField
              {...register('academicYear', { valueAsNumber: true })}
              id='new-academic-year'
              label='ปีการศึกษา (พ.ศ.)'
              type='number'
              required
              fullWidth
              disabled={isSaving}
              error={Boolean(errors.academicYear)}
              helperText={errors.academicYear?.message}
              slotProps={{ htmlInput: { min: activeAcademicYear + 1, max: 9999 } }}
            />
            <TextField
              {...register('term1Start')}
              id='new-year-term-1'
              label='วันเปิดภาคเรียนที่ 1'
              type='date'
              required
              fullWidth
              disabled={isSaving}
              error={Boolean(errors.term1Start)}
              helperText={errors.term1Start?.message || 'เลือกวันที่ตามปฏิทิน (ค.ศ.)'}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              {...register('term2Start')}
              id='new-year-term-2'
              label='วันเปิดภาคเรียนที่ 2'
              type='date'
              required
              fullWidth
              disabled={isSaving}
              error={Boolean(errors.term2Start)}
              helperText={errors.term2Start?.message || 'เลือกวันที่ตามปฏิทิน (ค.ศ.)'}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Alert severity='success'>
              เมื่อบันทึกจะเป็นสถานะ “รอเปิดใช้” ปีที่ใช้งานจะเปลี่ยนเมื่อกดยืนยันเปิดใช้เท่านั้น
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={onClose} disabled={isSaving}>
            ยกเลิก
          </Button>
          <Button type='submit' variant='contained' disabled={isSaving}>
            บันทึกปีการศึกษา
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateAcademicYearDialog;
