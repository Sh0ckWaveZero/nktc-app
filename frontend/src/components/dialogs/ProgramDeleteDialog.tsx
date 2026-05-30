'use client';

import { memo } from 'react';

import { GenericDeleteDialog } from '@/@core/components/dialogs';

import type { ProgramItem } from '@/hooks/queries/useDepartments';

interface ProgramDeleteDialogProps {
  open: boolean;
  program: ProgramItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ProgramDeleteDialog = memo(({ open, program, isDeleting, onClose, onConfirm }: ProgramDeleteDialogProps) => {
  const name = program?.name || 'หลักสูตร';

  return (
    <GenericDeleteDialog
      open={open}
      title='ยืนยันการลบหลักสูตร'
      itemName={name}
      isDeleting={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
      warningMessage='ลบแล้วกู้คืนอัตโนมัติไม่ได้'
    />
  );
});

ProgramDeleteDialog.displayName = 'ProgramDeleteDialog';

export default ProgramDeleteDialog;
