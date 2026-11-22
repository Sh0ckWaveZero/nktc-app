'use client';

import { Button } from '@mui/material';
import { isValid } from 'date-fns';
import { useState } from 'react';
import { RiRestartLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

import ConfirmDialog from '@/@core/components/dialogs/ConfirmDialog';
import { formatThaiDate } from '@/@core/utils/thai-calendar';
import { useResetAttendanceTerm } from '@/hooks/queries/use-reset-attendance-term';
import { useAcademicYearStore } from '@/store/academic-year';
import { getActivityTypeLabel } from '@/views/apps/admin/reports/activity-check-in/report-utils';

import type { ReactElement } from 'react';
import type { AcademicTerm } from '@/types/apps/academic-calendar';

interface ResetAttendanceTermButtonProps {
  academicYear: number;
  term: AcademicTerm;
  termName: string;
  startDate: Date;
  endDate: Date;
  activityType?: string;
}

interface ResetTarget {
  academicYear: number;
  term: AcademicTerm;
  activityType?: string;
  termName: string;
  reportName: string;
  dateLabel: string;
}

const ResetAttendanceTermButton = ({
  academicYear,
  term,
  termName,
  startDate,
  endDate,
  activityType,
}: ResetAttendanceTermButtonProps): ReactElement => {
  const [target, setTarget] = useState<ResetTarget | null>(null);
  const resetMutation: ReturnType<typeof useResetAttendanceTerm> = useResetAttendanceTerm();
  const activeAcademicYear: number | null = useAcademicYearStore((state) => state.activeAcademicYear);
  const isReadOnly: boolean = activeAcademicYear !== null && academicYear !== activeAcademicYear;
  const hasValidRange: boolean = isValid(startDate) && isValid(endDate) && startDate <= endDate;
  const handleOpen = (): void => {
    if (isReadOnly || resetMutation.isPending || !hasValidRange) return;
    setTarget({
      academicYear,
      term,
      activityType,
      termName,
      reportName: activityType ? `การเช็คชื่อ${getActivityTypeLabel(activityType)}` : 'การเช็คชื่อหน้าเสาธง',
      dateLabel: `${formatThaiDate(startDate)} - ${formatThaiDate(endDate)}`,
    });
  };
  const handleClose = (): void => {
    if (!resetMutation.isPending) setTarget(null);
  };
  const handleConfirm = (): void => {
    if (
      !target ||
      resetMutation.isPending ||
      (activeAcademicYear !== null && target.academicYear !== activeAcademicYear)
    )
      return;
    const { academicYear, term: selectedTerm, activityType: selectedActivityType } = target;
    resetMutation.mutate(
      { academicYear, term: selectedTerm, ...(selectedActivityType ? { activityType: selectedActivityType } : {}) },
      {
        onSuccess: (result): void => {
          toast.success(`รีเซ็ตข้อมูล${target.reportName} ${target.termName} สำเร็จ (${result.deleted} รายการ)`);
          setTarget(null);
        },
        onError: (): void => {
          toast.error('ไม่สามารถรีเซ็ตข้อมูลได้ กรุณาลองอีกครั้ง');
        },
      },
    );
  };
  return (
    <>
      <Button
        variant='outlined'
        color='error'
        startIcon={<RiRestartLine />}
        disabled={isReadOnly || resetMutation.isPending || !hasValidRange}
        onClick={handleOpen}
        sx={{ width: { xs: '100%', sm: 'auto' }, ml: { sm: 'auto' } }}
      >
        รีเซ็ตข้อมูลภาคเรียนนี้
      </Button>
      <ConfirmDialog
        open={target !== null}
        options={{
          title: 'ยืนยันการรีเซ็ตข้อมูลรายภาคเรียน',
          message: target
            ? `ต้องการลบข้อมูล${target.reportName}ทุกห้องเรียนของ ${target.termName} ปีการศึกษา ${target.academicYear} ตลอดภาคเรียน (${target.dateLabel}) หรือไม่?`
            : '',
          confirmText: 'ยืนยันรีเซ็ตข้อมูล',
          severity: 'error',
          showWarning: true,
          warningMessage: 'ข้อมูลที่ลบแล้วไม่สามารถกู้คืนได้ กรุณาตรวจสอบภาคเรียนก่อนยืนยัน',
        }}
        onClose={handleClose}
        onConfirm={handleConfirm}
        isConfirming={resetMutation.isPending}
      />
    </>
  );
};

export default ResetAttendanceTermButton;
