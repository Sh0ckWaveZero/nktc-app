'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';

import type { DepartmentItem, LevelItem, ProgramItem, ProgramPayload } from '@/hooks/queries/useDepartments';

interface ProgramFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData: ProgramItem | null;
  departments: DepartmentItem[];
  levels: LevelItem[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ProgramPayload) => void;
}

const CONTROL_RADIUS = 12;

const STATUS_OPTIONS = [
  { value: 'active', label: 'เปิดใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
] as const;

const schema = z.object({
  programId: z.string().trim().min(1, 'กรุณากรอกรหัสสาขา'),
  name: z.string().trim().min(1, 'กรุณากรอกชื่อสาขา'),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  levelId: z.string().optional(),
  status: z.string().min(1, 'กรุณาเลือกสถานะ'),
});

type ProgramFormValues = z.infer<typeof schema>;

const FORM_ITEM_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: `${CONTROL_RADIUS}px`,
    backgroundColor: (theme: any) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.92 : 0.86),
    color: 'text.primary',
    transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
    '& fieldset': {
      borderColor: (theme: any) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.16 : 0.12),
    },
    '&:hover fieldset': {
      borderColor: (theme: any) => alpha(theme.palette.primary.main, 0.28),
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiInputBase-input': {
    letterSpacing: '-0.01em',
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'text.secondary',
    opacity: 1,
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.92rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  '& .MuiInputLabel-shrink': {
    fontSize: '0.86rem',
  },
} as const;

const ProgramFormDialog = ({
  open,
  mode,
  initialData,
  departments,
  levels,
  isSubmitting,
  onClose,
  onSubmit,
}: ProgramFormDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      programId: '',
      name: '',
      description: '',
      departmentId: '',
      levelId: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      programId: initialData?.programId ?? '',
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      departmentId: initialData?.departmentId ?? '',
      levelId: initialData?.levelId ?? '',
      status: initialData?.status ?? 'active',
    });
  }, [initialData, open, reset]);

  const handleFormSubmit = (values: ProgramFormValues) => {
    onSubmit({
      programId: mode === 'create' ? values.programId.trim() : undefined,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      departmentId: values.departmentId || undefined,
      levelId: values.levelId || undefined,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} fullWidth maxWidth='sm' onClose={isSubmitting ? undefined : onClose}>
      <DialogTitle>{mode === 'create' ? 'เพิ่มสาขาวิชาใหม่' : 'แก้ไขข้อมูลสาขาวิชา'}</DialogTitle>
      <DialogContent>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          {mode === 'create'
            ? 'กำหนดรหัสสาขา ชื่อสาขา แผนก และระดับชั้นเพื่อให้พร้อมใช้งานในระบบ'
            : 'อัปเดตรายละเอียดสาขาวิชาโดยยังคงรหัสสาขาเดิมไว้เป็นคีย์อ้างอิง'}
        </Typography>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <Controller
            name='programId'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='รหัสสาขา'
                placeholder='เช่น P001'
                disabled={mode === 'edit'}
                error={Boolean(errors.programId)}
                helperText={
                  errors.programId?.message ||
                  (mode === 'edit'
                    ? 'รหัสสาขาจะไม่สามารถแก้ไขได้หลังสร้างแล้ว'
                    : 'ใช้เป็นรหัสอ้างอิงสำหรับ import และเชื่อมข้อมูล')
                }
                sx={FORM_ITEM_SX}
              />
            )}
          />

          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='ชื่อสาขา'
                placeholder='เช่น เทคโนโลยีสารสนเทศ'
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                sx={FORM_ITEM_SX}
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                label='คำอธิบาย'
                placeholder='อธิบายรายละเอียดของสาขาวิชา'
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                sx={FORM_ITEM_SX}
              />
            )}
          />

          <Controller
            name='departmentId'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.departmentId)} sx={FORM_ITEM_SX}>
                <InputLabel id='program-department-label'>แผนก</InputLabel>
                <Select {...field} labelId='program-department-label' label='แผนก'>
                  <MenuItem value=''>ไม่ระบุแผนก</MenuItem>
                  {departments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.departmentId && <FormHelperText>{errors.departmentId.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name='levelId'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.levelId)} sx={FORM_ITEM_SX}>
                <InputLabel id='program-level-label'>ระดับชั้น</InputLabel>
                <Select {...field} labelId='program-level-label' label='ระดับชั้น'>
                  <MenuItem value=''>ไม่ระบุระดับชั้น</MenuItem>
                  {levels.map((level) => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.levelName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.levelId && <FormHelperText>{errors.levelId.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.status)} sx={FORM_ITEM_SX}>
                <InputLabel id='program-status-label'>สถานะ</InputLabel>
                <Select {...field} labelId='program-status-label' label='สถานะ'>
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 6, pb: 5, pt: 1 }}>
        <Button color='secondary' variant='outlined' onClick={onClose} disabled={isSubmitting}>
          ยกเลิก
        </Button>
        <Button variant='contained' onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting}>
          {mode === 'create' ? 'บันทึกสาขา' : 'อัปเดตข้อมูล'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramFormDialog;
