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

import type { ClassroomItem, ClassroomPayload } from '@/hooks/queries/useClassrooms';
import type { DepartmentItem, LevelItem, ProgramItem } from '@/hooks/queries/useDepartments';

interface ClassroomFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData: ClassroomItem | null;
  departments: DepartmentItem[];
  programs: ProgramItem[];
  levels: LevelItem[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ClassroomPayload) => void;
}

const CONTROL_RADIUS = 12;

const STATUS_OPTIONS = [
  { value: 'active', label: 'เปิดใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
] as const;

const schema = z.object({
  classroomId: z.string().trim().min(1, 'กรุณากรอกรหัสห้องเรียน'),
  name: z.string().trim().min(1, 'กรุณากรอกชื่อห้องเรียน'),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  programId: z.string().optional(),
  levelId: z.string().optional(),
  status: z.string().min(1, 'กรุณาเลือกสถานะ'),
});

type ClassroomFormValues = z.infer<typeof schema>;

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

const ClassroomFormDialog = ({
  open,
  mode,
  initialData,
  departments,
  programs,
  levels,
  isSubmitting,
  onClose,
  onSubmit,
}: ClassroomFormDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ClassroomFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      classroomId: '',
      name: '',
      description: '',
      departmentId: '',
      programId: '',
      levelId: '',
      status: 'active',
    },
  });

  const selectedDepartmentId = watch('departmentId');
  const filteredPrograms = selectedDepartmentId
    ? programs.filter((program) => !program.departmentId || program.departmentId === selectedDepartmentId)
    : programs;

  useEffect(() => {
    if (!open) return;

    reset({
      classroomId: initialData?.classroomId ?? '',
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      departmentId: initialData?.departmentId ?? '',
      programId: initialData?.programId ?? '',
      levelId: initialData?.levelId ?? '',
      status: initialData?.status ?? 'active',
    });
  }, [initialData, open, reset]);

  const handleFormSubmit = (values: ClassroomFormValues) => {
    onSubmit({
      classroomId: mode === 'create' ? values.classroomId.trim() : undefined,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      departmentId: values.departmentId || undefined,
      programId: values.programId || undefined,
      levelId: values.levelId || undefined,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} fullWidth maxWidth='sm' onClose={isSubmitting ? undefined : onClose}>
      <DialogTitle>{mode === 'create' ? 'เพิ่มห้องเรียนใหม่' : 'แก้ไขข้อมูลห้องเรียน'}</DialogTitle>
      <DialogContent>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          {mode === 'create'
            ? 'กำหนดรหัส ชื่อ ห้องเรียน และความสัมพันธ์กับแผนก สาขา และระดับชั้นให้พร้อมใช้งาน'
            : 'อัปเดตรายละเอียดของห้องเรียนโดยยังคงรหัสห้องเรียนเดิมไว้เป็นคีย์อ้างอิง'}
        </Typography>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <Controller
            name='classroomId'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='รหัสห้องเรียน'
                placeholder='เช่น CR001'
                disabled={mode === 'edit'}
                error={Boolean(errors.classroomId)}
                helperText={
                  errors.classroomId?.message ||
                  (mode === 'edit'
                    ? 'รหัสห้องเรียนจะไม่สามารถแก้ไขได้หลังสร้างแล้ว'
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
                label='ชื่อห้องเรียน'
                placeholder='เช่น ปวช.1/1-เทคโนโลยีสารสนเทศ'
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
                placeholder='อธิบายรายละเอียดของห้องเรียน'
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
                <InputLabel id='classroom-department-label'>แผนก</InputLabel>
                <Select {...field} labelId='classroom-department-label' label='แผนก'>
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
            name='programId'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.programId)} sx={FORM_ITEM_SX}>
                <InputLabel id='classroom-program-label'>สาขาวิชา</InputLabel>
                <Select {...field} labelId='classroom-program-label' label='สาขาวิชา'>
                  <MenuItem value=''>ไม่ระบุสาขา</MenuItem>
                  {filteredPrograms.map((program) => (
                    <MenuItem key={program.id} value={program.id}>
                      {program.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.programId && <FormHelperText>{errors.programId.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name='levelId'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.levelId)} sx={FORM_ITEM_SX}>
                <InputLabel id='classroom-level-label'>ระดับชั้น</InputLabel>
                <Select {...field} labelId='classroom-level-label' label='ระดับชั้น'>
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
                <InputLabel id='classroom-status-label'>สถานะ</InputLabel>
                <Select {...field} labelId='classroom-status-label' label='สถานะ'>
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
          {mode === 'create' ? 'บันทึกห้องเรียน' : 'อัปเดตข้อมูล'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassroomFormDialog;
