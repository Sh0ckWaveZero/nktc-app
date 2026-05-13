'use client';

import { memo } from 'react';
import { alpha, Box } from '@mui/material';
import { RiArrowUpLine } from 'react-icons/ri';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material';

interface ClassroomOption {
  id: string;
  name: string;
  classroomId?: string;
}

interface StudentData {
  user?: {
    account?: {
      title?: string;
      firstName?: string;
      lastName?: string;
    };
  };
  classroom?: {
    name?: string;
    id?: string;
  };
}

interface StudentIndividualPromotionDialogProps {
  open: boolean;
  student: StudentData | null;
  classrooms: ClassroomOption[];
  targetClassroom: ClassroomOption | null;
  isPromoting: boolean;
  onTargetChange: (value: ClassroomOption | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const StudentIndividualPromotionDialog = memo(
  ({
    open,
    student,
    classrooms,
    targetClassroom,
    isPromoting,
    onTargetChange,
    onConfirm,
    onCancel,
  }: StudentIndividualPromotionDialogProps) => {
    const fullName = student
      ? `${student.user?.account?.title ?? ''}${student.user?.account?.firstName ?? ''} ${student.user?.account?.lastName ?? ''}`.trim()
      : '';
    const currentClassroom = student?.classroom?.name ?? '';

    return (
      <Dialog
        open={open}
        fullWidth
        maxWidth='xs'
        onClose={onCancel}
        aria-labelledby='individual-promotion-dialog-title'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 6, pt: 6, pb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              mb: 3,
            }}
          >
            <RiArrowUpLine size={28} />
          </Box>
          <Typography variant='h6' fontWeight={600} textAlign='center' id='individual-promotion-dialog-title'>
            เลื่อนชั้นนักเรียน
          </Typography>
        </Box>

        <DialogContent sx={{ px: 6, pt: 2, pb: 4, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1, lineHeight: 1.8 }}>
            {'ย้าย '}
            <Typography component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {fullName}
            </Typography>
            {' จากห้อง '}
            <Typography component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {currentClassroom}
            </Typography>
            {' ไปยังห้องเรียนปลายทาง'}
          </Typography>
          <Autocomplete
            id='individual-promote-target-classroom'
            options={classrooms.filter((c) => c.id !== student?.classroom?.id)}
            getOptionLabel={(option) => option?.name ?? option?.classroomId ?? ''}
            value={targetClassroom}
            onChange={(_, value) => onTargetChange(value)}
            disabled={isPromoting}
            renderInput={(params) => (
              <TextField {...params} label='ห้องเรียนปลายทาง' placeholder='เลือกห้องเรียน...' />
            )}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            noOptionsText='ไม่พบห้องเรียน'
            sx={{ mt: 3 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
          <Button
            variant='outlined'
            color='inherit'
            onClick={onCancel}
            disabled={isPromoting}
            fullWidth
            id='individual-promotion-dialog-cancel'
          >
            ยกเลิก
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={onConfirm}
            disabled={!targetClassroom || isPromoting}
            fullWidth
            id='individual-promotion-dialog-confirm'
          >
            {isPromoting ? 'กำลังเลื่อนชั้น...' : 'ยืนยัน'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

StudentIndividualPromotionDialog.displayName = 'StudentIndividualPromotionDialog';

export default StudentIndividualPromotionDialog;
