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

import type { DepartmentItem } from '@/hooks/queries/useDepartments';

interface DepartmentDeleteDialogProps {
  open: boolean;
  department: DepartmentItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DepartmentDeleteDialog = ({ open, department, isDeleting, onClose, onConfirm }: DepartmentDeleteDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth='xs' onClose={isDeleting ? undefined : onClose}>
      <DialogTitle>ยืนยันการลบแผนกวิชา</DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ mb: 3 }}>
          คุณกำลังจะลบ <strong>{department?.name || 'แผนกวิชา'}</strong>{' '}
          {department?.departmentId ? `(${department.departmentId})` : ''} ออกจากระบบ
        </Typography>
        <Alert severity='warning'>
          <AlertTitle>ลบแล้วกู้คืนอัตโนมัติไม่ได้</AlertTitle>
          ระบบจะยอมลบได้เฉพาะแผนกที่ยังไม่มีครู นักเรียน สาขา หรือห้องเรียนเชื่อมอยู่เท่านั้น
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 6, pb: 5, pt: 1 }}>
        <Button color='secondary' variant='outlined' onClick={onClose} disabled={isDeleting}>
          ยกเลิก
        </Button>
        <Button color='error' variant='contained' onClick={onConfirm} disabled={isDeleting}>
          ลบแผนก
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentDeleteDialog;
