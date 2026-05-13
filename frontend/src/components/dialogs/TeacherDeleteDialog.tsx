'use client';

import { memo } from 'react';

import { GenericDeleteDialog } from '@/@core/components/dialogs';

interface TeacherDeleteDialogProps {
  open: boolean;
  teacher: { title?: string; firstName: string; lastName: string } | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const TeacherDeleteDialog = memo(({ open, teacher, isDeleting, onClose, onConfirm }: TeacherDeleteDialogProps) => {
  const fullName = `${teacher?.title ? teacher?.title : ''}${teacher?.firstName} ${teacher?.lastName}`.trim();

  return (
    <GenericDeleteDialog
      open={open}
      title='ยืนยันการลบข้อมูลครู / บุคลากร'
      itemName={fullName}
      isDeleting={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
});

TeacherDeleteDialog.displayName = 'TeacherDeleteDialog';

export default TeacherDeleteDialog;
