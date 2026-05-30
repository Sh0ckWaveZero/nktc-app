'use client';

import { memo } from 'react';

import { GenericGraduationDialog } from '@/@core/components/dialogs';

import type { StudentData } from '@/types/apps/studentTypes';

interface StudentGraduationDialogProps {
  open: boolean;
  student: StudentData | null;
  isGraduating: boolean;
  onClose: () => void;
  onConfirm: (graduationDate: Date) => void;
}

const StudentGraduationDialog = memo(
  ({ open, student, isGraduating, onClose, onConfirm }: StudentGraduationDialogProps) => {
    const fullName =
      `${student?.user?.account?.title ?? ''}${student?.user?.account?.firstName ?? ''} ${student?.user?.account?.lastName ?? ''}`.trim();

    return (
      <GenericGraduationDialog
        open={open}
        title='ยืนยันการจบการศึกษา'
        entityName={fullName}
        isGraduating={isGraduating}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
  },
);

StudentGraduationDialog.displayName = 'StudentGraduationDialog';

export default StudentGraduationDialog;
