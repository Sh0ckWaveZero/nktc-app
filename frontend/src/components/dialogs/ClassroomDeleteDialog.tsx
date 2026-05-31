'use client';

import { memo } from 'react';

import { GenericDeleteDialog } from '@/@core/components/dialogs';

import type { ClassroomItem } from '@/hooks/queries/useClassrooms';

interface ClassroomDeleteDialogProps {
  open: boolean;
  classroom: ClassroomItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ClassroomDeleteDialog = memo(
  ({ open, classroom, isDeleting, onClose, onConfirm }: ClassroomDeleteDialogProps) => {
    const name = classroom?.name || 'ห้องเรียน';

    return (
      <GenericDeleteDialog
        open={open}
        title='ยืนยันการลบห้องเรียน'
        itemName={name}
        itemIdentifier={classroom?.classroomId}
        isDeleting={isDeleting}
        onClose={onClose}
        onConfirm={onConfirm}
        warningMessage='ลบแล้วกู้คืนอัตโนมัติไม่ได้ ระบบจะยอมลบได้เฉพาะห้องเรียนที่ยังไม่มีนักเรียน ครู รายวิชา หรือรายงานเชื่อมอยู่เท่านั้น'
      />
    );
  },
);

ClassroomDeleteDialog.displayName = 'ClassroomDeleteDialog';

export default ClassroomDeleteDialog;
