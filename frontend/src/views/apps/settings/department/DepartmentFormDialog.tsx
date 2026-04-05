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

import type { DepartmentItem, DepartmentPayload } from '@/hooks/queries/useDepartments';

interface DepartmentFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData: DepartmentItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: DepartmentPayload) => void;
}

const CONTROL_RADIUS = 12;

const STATUS_OPTIONS = [
  { value: 'active', label: 'เปิดใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
] as const;

const schema = z.object({
  departmentId: z.string().trim().min(1, 'กรุณากรอกรหัสแผนก'),
  name: z.string().trim().min(1, 'กรุณากรอกชื่อแผนก'),
  description: z.string().optional(),
  status: z.string().min(1, 'กรุณาเลือกสถานะ'),
});

type DepartmentFormValues = z.infer<typeof schema>;

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

const DepartmentFormDialog = ({
  open,
  mode,
  initialData,
  isSubmitting,
  onClose,
  onSubmit,
}: DepartmentFormDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      departmentId: '',
      name: '',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      departmentId: initialData?.departmentId ?? '',
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? 'active',
    });
  }, [initialData, open, reset]);

  const handleFormSubmit = (values: DepartmentFormValues) => {
    onSubmit({
      departmentId: mode === 'create' ? values.departmentId?.trim() || undefined : undefined,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} fullWidth maxWidth='sm' onClose={isSubmitting ? undefined : onClose}>
      <DialogTitle>{mode === 'create' ? 'เพิ่มแผนกวิชาใหม่' : 'แก้ไขข้อมูลแผนกวิชา'}</DialogTitle>
      <DialogContent>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          {mode === 'create'
            ? 'กำหนดรหัส ชื่อ และสถานะของแผนกวิชาให้พร้อมใช้งานในระบบ'
            : 'อัปเดตรายละเอียดของแผนกวิชาโดยไม่กระทบกับภาษาออกแบบและการใช้งานเดิม'}
        </Typography>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <Controller
            name='departmentId'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='รหัสแผนก'
                placeholder='เช่น D011'
                disabled={mode === 'edit'}
                error={Boolean(errors.departmentId)}
                helperText={
                  errors.departmentId?.message ||
                  (mode === 'edit'
                    ? 'รหัสแผนกจะไม่สามารถแก้ไขได้หลังสร้างแล้ว'
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
                label='ชื่อแผนก'
                placeholder='เช่น แผนกวิชาเทคโนโลยีสารสนเทศ'
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
                placeholder='อธิบายขอบเขตหรือรายละเอียดของแผนกวิชา'
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                sx={FORM_ITEM_SX}
              />
            )}
          />

          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.status)} sx={FORM_ITEM_SX}>
                <InputLabel id='department-status-label'>สถานะ</InputLabel>
                <Select {...field} labelId='department-status-label' label='สถานะ'>
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
          {mode === 'create' ? 'บันทึกแผนก' : 'อัปเดตข้อมูล'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentFormDialog;
