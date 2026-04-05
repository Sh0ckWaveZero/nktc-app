'use client';

import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import type { ClassroomItem } from '@/hooks/queries/useClassrooms';

interface ClassroomDeleteDialogProps {
  open: boolean;
  classroom: ClassroomItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ClassroomDeleteDialog = ({ open, classroom, isDeleting, onClose, onConfirm }: ClassroomDeleteDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth='xs' onClose={isDeleting ? undefined : onClose}>
      <DialogTitle>ยืนยันการลบห้องเรียน</DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ mb: 3 }}>
          คุณกำลังจะลบ <strong>{classroom?.name || 'ห้องเรียน'}</strong>{' '}
          {classroom?.classroomId ? `(${classroom.classroomId})` : ''} ออกจากระบบ
        </Typography>
        <Alert severity='warning'>
          <AlertTitle>ลบแล้วกู้คืนอัตโนมัติไม่ได้</AlertTitle>
          ระบบจะยอมลบได้เฉพาะห้องเรียนที่ยังไม่มีนักเรียน ครู รายวิชา หรือรายงานเชื่อมอยู่เท่านั้น
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 6, pb: 5, pt: 1 }}>
        <Button color='secondary' variant='outlined' onClick={onClose} disabled={isDeleting}>
          ยกเลิก
        </Button>
        <Button color='error' variant='contained' onClick={onConfirm} disabled={isDeleting}>
          ลบห้องเรียน
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassroomDeleteDialog;
