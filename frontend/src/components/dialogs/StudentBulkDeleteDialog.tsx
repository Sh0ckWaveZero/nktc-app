'use client';

import { memo } from 'react';
import { Typography } from '@mui/material';

import ConfirmDialog, { type ConfirmDialogOptions } from '@/@core/components/dialogs/ConfirmDialog';

interface StudentBulkDeleteDialogProps {
  open: boolean;
  classroomName: string;
  studentCount: number;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const StudentBulkDeleteDialog = memo(({ open, classroomName, studentCount, isDeleting, onClose, onConfirm }: StudentBulkDeleteDialogProps) => {
  const options: ConfirmDialogOptions = {
    title: 'ยืนยันการลบนักเรียนทั้งหมด',
    message: (
      <>
        คุณต้องการลบนักเรียนทั้งหมด{' '}
        <Typography component='span' sx={{ color: 'error.main', fontWeight: 600 }}>
          {studentCount} คน
        </Typography>
        {' จากห้อง '}
        <Typography component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {classroomName}
        </Typography>
        {' ใช่หรือไม่?'}
      </>
    ),
    severity: 'error',
    confirmText: 'ลบทั้งหมด',
    cancelText: 'ยกเลิก',
    showWarning: true,
    warningMessage: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลนักเรียนและข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบออกจากระบบ',
  };

  return <ConfirmDialog open={open} options={options} onClose={onClose} onConfirm={onConfirm} isConfirming={isDeleting} />;
});

StudentBulkDeleteDialog.displayName = 'StudentBulkDeleteDialog';

export default StudentBulkDeleteDialog;
