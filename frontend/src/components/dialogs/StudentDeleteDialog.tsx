'use client';

import { memo } from 'react';

import { GenericDeleteDialog } from '@/@core/components/dialogs';

import type { StudentData } from '@/types/apps/studentTypes';

interface StudentDeleteDialogProps {
  open: boolean;
  student: StudentData | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const StudentDeleteDialog = memo(({ open, student, isDeleting, onClose, onConfirm }: StudentDeleteDialogProps) => {
  const fullName =
    `${student?.user?.account?.title ?? ''}${student?.user?.account?.firstName ?? ''} ${student?.user?.account?.lastName ?? ''}`.trim();

  return (
    <GenericDeleteDialog
      open={open}
      title='ยืนยันการลบข้อมูล'
      itemName={fullName}
      isDeleting={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
      warningMessage='การดำเนินการนี้ไม่สามารถย้อนกลับได้'
    />
  );
});

StudentDeleteDialog.displayName = 'StudentDeleteDialog';

export default StudentDeleteDialog;
