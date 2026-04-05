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

import type { ProgramItem } from '@/hooks/queries/useDepartments';

interface ProgramDeleteDialogProps {
  open: boolean;
  program: ProgramItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ProgramDeleteDialog = ({ open, program, isDeleting, onClose, onConfirm }: ProgramDeleteDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth='xs' onClose={isDeleting ? undefined : onClose}>
      <DialogTitle>ยืนยันการลบสาขาวิชา</DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ mb: 3 }}>
          คุณกำลังจะลบ <strong>{program?.name || 'สาขาวิชา'}</strong>{' '}
          {program?.programId ? `(${program.programId})` : ''} ออกจากระบบ
        </Typography>
        <Alert severity='warning'>
          <AlertTitle>ลบแล้วกู้คืนอัตโนมัติไม่ได้</AlertTitle>
          ระบบจะยอมลบได้เฉพาะสาขาที่ยังไม่มีนักเรียน ครู ห้องเรียน หรือรายวิชาเชื่อมอยู่เท่านั้น
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 6, pb: 5, pt: 1 }}>
        <Button color='secondary' variant='outlined' onClick={onClose} disabled={isDeleting}>
          ยกเลิก
        </Button>
        <Button color='error' variant='contained' onClick={onConfirm} disabled={isDeleting}>
          ลบสาขา
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramDeleteDialog;
