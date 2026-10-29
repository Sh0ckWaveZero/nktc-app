import { ADMIN_ACTIVITY_TYPES } from '@/views/apps/admin/reports/activity-check-in/report-utils';

import type { SelectChangeEvent } from '@mui/material';
import type { ReactElement } from 'react';
import type { useAdminCheckInReport } from '@/hooks/queries/use-admin-check-in-report';
import type { AdminCheckInReportPeriod } from '@/utils/admin-check-in-report';

import TableHeader from './TableHeader';
import TableHeaderMonthly from './TableHeaderMonthly';
import TableHeaderWeekly from './TableHeaderWeekly';

interface ActivityReportControls {
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  onExport: () => Promise<void>;
  isExportDisabled: boolean;
}

interface AdminCheckInReportToolbarProps {
  period: AdminCheckInReportPeriod;
  report: ReturnType<typeof useAdminCheckInReport>;
  activity?: ActivityReportControls;
}

interface ReportTableHeaderProps {
  selectedDate: Date | null;
  handleSelectedDate: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  activityType?: string;
  handleActivityTypeChange?: (event: SelectChangeEvent<string>) => void;
  activityTypes?: { value: string; label: string }[];
  onExport?: () => Promise<void>;
  isExportDisabled?: boolean;
}

const AdminCheckInReportToolbar = ({ period, report, activity }: AdminCheckInReportToolbarProps): ReactElement => {
  const { selectedDate, handleSelectedDate, weeks } = report;
  const headerProps: ReportTableHeaderProps = {
    selectedDate,
    handleSelectedDate,
    minDate: weeks[0]?.start,
    maxDate: weeks[weeks.length - 1]?.end,
    activityType: activity?.value,
    handleActivityTypeChange: activity?.onChange,
    activityTypes: activity ? ADMIN_ACTIVITY_TYPES : undefined,
    onExport: activity?.onExport,
    isExportDisabled: activity?.isExportDisabled,
  };
  if (period === 'weekly') return <TableHeaderWeekly {...headerProps} academicWeeks={weeks} />;
  if (period === 'monthly') return <TableHeaderMonthly {...headerProps} />;
  return <TableHeader {...headerProps} />;
};

export default AdminCheckInReportToolbar;
