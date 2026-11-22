import { Alert, Button } from '@mui/material';

import Spinner from '@/@core/components/spinner';

import type { UseQueryResult } from '@tanstack/react-query';
import type { ComponentType, ReactElement } from 'react';
import type { CheckInClassroom, ReportCheckIn } from '@/types/apps/reportCheckIn';

import TableCollapsible from './TableCollapsible';

interface CheckInReportResultsProps {
  hasSelectedRange: boolean;
  query: UseQueryResult<ReportCheckIn, Error>;
  TableComponent?: ComponentType<{ values: CheckInClassroom[] }>;
}

const CheckInReportResults = ({
  hasSelectedRange,
  query,
  TableComponent = TableCollapsible,
}: CheckInReportResultsProps): ReactElement => {
  if (!hasSelectedRange) {
    return (
      <Alert severity='info' sx={{ m: 5 }}>
        กรุณาเลือกวันที่ในภาคเรียนเพื่อดูรายงาน
      </Alert>
    );
  }
  if (query.isPending) return <Spinner />;
  if (query.isError) {
    return (
      <Alert
        severity='error'
        sx={{ m: 5 }}
        action={
          <Button color='inherit' onClick={() => void query.refetch()}>
            ลองอีกครั้ง
          </Button>
        }
      >
        ไม่สามารถโหลดรายงานการเช็คชื่อได้
      </Alert>
    );
  }
  const rows: CheckInClassroom[] = query.data.checkIn ?? [];
  if (!rows.length) {
    return (
      <Alert severity='info' sx={{ m: 5 }}>
        ไม่พบข้อมูลการเช็คชื่อในช่วงวันที่เลือก
      </Alert>
    );
  }
  return <TableComponent values={rows} />;
};

export default CheckInReportResults;
