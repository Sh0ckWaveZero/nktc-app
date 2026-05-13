'use client';

import { memo } from 'react';

import { GenericDeleteDialog } from '@/@core/components/dialogs';

import type { DepartmentItem } from '@/hooks/queries/useDepartments';

interface DepartmentDeleteDialogProps {
  open: boolean;
  department: DepartmentItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DepartmentDeleteDialog = memo(({ open, department, isDeleting, onClose, onConfirm }: DepartmentDeleteDialogProps) => {
  const name = department?.name || 'สาขาวิชา';

  return (
    <GenericDeleteDialog
      open={open}
      title='ยืนยันการลบสาขาวิชา'
      itemName={name}
      isDeleting={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
      warningMessage='ลบแล้วกู้คืนอัตโนมัติไม่ได้'
    />
  );
});

DepartmentDeleteDialog.displayName = 'DepartmentDeleteDialog';

export default DepartmentDeleteDialog;
