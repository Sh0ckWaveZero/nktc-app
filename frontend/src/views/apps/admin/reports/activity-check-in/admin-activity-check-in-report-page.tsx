'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { formatThaiDate } from '@/@core/utils/thai-calendar';
import { useAdminCheckInReport } from '@/hooks/queries/use-admin-check-in-report';
import { getTermStart } from '@/utils/academic-calendar';
import { getAdminCheckInReportPeriodLabel } from '@/utils/admin-check-in-report';
import AcademicCheckInReportPage from '@/views/apps/admin/reports/check-in/academic-check-in-report-page';
import AdminCheckInReportToolbar from '@/views/apps/admin/reports/check-in/admin-check-in-report-toolbar';
import CheckInReportResults from '@/views/apps/admin/reports/check-in/check-in-report-results';

import type { SelectChangeEvent } from '@mui/material';
import type { ReactElement } from 'react';
import type { AdminCheckInReportPeriod } from '@/utils/admin-check-in-report';

import { exportAdminActivityCheckInReport, getActivityTypeLabel } from './report-utils';
import TableCollapsible from './TableCollapsible';

interface AdminActivityCheckInReportPageProps {
  period: AdminCheckInReportPeriod;
}

const AdminActivityCheckInReportPage = ({ period }: AdminActivityCheckInReportPageProps): ReactElement => {
  const [activityType, setActivityType] = useState<string>('CLUB');
  const report: ReturnType<typeof useAdminCheckInReport> = useAdminCheckInReport(period, activityType);
  const { reportQuery, settings, selectedTerm, range } = report;
  const isExportDisabled: boolean =
    reportQuery.isFetching || !reportQuery.isSuccess || !range || !(reportQuery.data?.checkIn?.length ?? 0);
  const activityTypeLabel: string = getActivityTypeLabel(activityType);
  const handleActivityTypeChange = (event: SelectChangeEvent<string>): void => {
    setActivityType(event.target.value);
  };
  const handleExportExcel = async (): Promise<void> => {
    if (isExportDisabled || !reportQuery.data || !settings || !range) return;
    const termName: string = selectedTerm === 1 ? settings.term1Name : settings.term2Name;
    const termStart: Date = getTermStart(settings, selectedTerm);
    const periodLabel: string = getAdminCheckInReportPeriodLabel(period, range);
    try {
      await exportAdminActivityCheckInReport({
        report: reportQuery.data,
        activityType,
        reportTitle: 'รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน',
        periodLabel: `${termName} · วันเปิดเทอม ${formatThaiDate(termStart)} · ${periodLabel}`,
        filePrefix: `admin_activity_checkin_${period}`,
      });
    } catch (error) {
      console.error('Activity report export failed:', error);
      toast.error('ไม่สามารถส่งออกรายงานได้');
    }
  };
  return (
    <AcademicCheckInReportPage
      period={period}
      report={report}
      title={`รายงานสถิติการเข้าร่วม${activityTypeLabel} ของนักเรียน ทั้งหมด ${reportQuery.data?.students ?? 0} คน`}
    >
      <AdminCheckInReportToolbar
        period={period}
        report={report}
        activity={{
          value: activityType,
          onChange: handleActivityTypeChange,
          onExport: handleExportExcel,
          isExportDisabled,
        }}
      />
      <CheckInReportResults hasSelectedRange={Boolean(range)} query={reportQuery} TableComponent={TableCollapsible} />
    </AcademicCheckInReportPage>
  );
};

export default AdminActivityCheckInReportPage;
