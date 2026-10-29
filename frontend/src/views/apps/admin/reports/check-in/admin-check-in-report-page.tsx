'use client';

import { useAdminCheckInReport } from '@/hooks/queries/use-admin-check-in-report';

import type { ReactElement } from 'react';
import type { AdminCheckInReportPeriod } from '@/utils/admin-check-in-report';

import AcademicCheckInReportPage from './academic-check-in-report-page';
import AdminCheckInReportToolbar from './admin-check-in-report-toolbar';
import CheckInReportResults from './check-in-report-results';

interface AdminCheckInReportPageProps {
  period: AdminCheckInReportPeriod;
}

const AdminCheckInReportPage = ({ period }: AdminCheckInReportPageProps): ReactElement => {
  const report: ReturnType<typeof useAdminCheckInReport> = useAdminCheckInReport(period);
  return (
    <AcademicCheckInReportPage
      period={period}
      report={report}
      title={`รายงานสถิติการมาเรียนของนักเรียน ทั้งหมด ${report.reportQuery.data?.students ?? 0} คน`}
    >
      <AdminCheckInReportToolbar period={period} report={report} />
      <CheckInReportResults hasSelectedRange={Boolean(report.range)} query={report.reportQuery} />
    </AcademicCheckInReportPage>
  );
};

export default AdminCheckInReportPage;
