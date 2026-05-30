'use client';

import { memo } from 'react';

import { GenericGraduationDialog } from '@/@core/components/dialogs';

interface StudentBulkGraduationDialogProps {
  open: boolean;
  classroomName: string;
  studentCount: number;
  isGraduating: boolean;
  onClose: () => void;
  onConfirm: (graduationDate: Date) => void;
}

const StudentBulkGraduationDialog = memo(
  ({ open, classroomName, studentCount, isGraduating, onClose, onConfirm }: StudentBulkGraduationDialogProps) => {
    const entityName = `นักเรียน ${studentCount} คน ในห้อง "${classroomName}"`;

    return (
      <GenericGraduationDialog
        open={open}
        title='ยืนยันการจบการศึกษาทั้งห้อง'
        entityName={entityName}
        isGraduating={isGraduating}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
  },
);

StudentBulkGraduationDialog.displayName = 'StudentBulkGraduationDialog';

export default StudentBulkGraduationDialog;
