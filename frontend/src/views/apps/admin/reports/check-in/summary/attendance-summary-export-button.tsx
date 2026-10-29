import { FileDownloadOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { exportAttendanceSummary } from '@/utils/attendance-summary';

import type { ReactElement } from 'react';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';

interface AttendanceSummaryExportButtonProps {
  data: AttendanceSummary;
}

const AttendanceSummaryExportButton = ({ data }: AttendanceSummaryExportButtonProps): ReactElement => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      await exportAttendanceSummary(data);
    } catch (error) {
      console.error('Attendance summary export failed:', error);
      toast.error('ไม่สามารถส่งออกสรุปสถิติได้');
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <Button
      variant='outlined'
      color='success'
      startIcon={<FileDownloadOutlined />}
      disabled={isExporting || !data.totals.total}
      onClick={(): void => {
        void handleExport();
      }}
    >
      ดาวน์โหลดสรุป Excel
    </Button>
  );
};

export default AttendanceSummaryExportButton;
