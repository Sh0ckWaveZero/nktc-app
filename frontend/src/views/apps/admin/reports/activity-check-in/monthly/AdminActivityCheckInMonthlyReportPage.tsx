'use client';

// ** Types Imports
import { Avatar, Card, CardHeader } from '@mui/material';
import { startOfMonth, endOfMonth } from 'date-fns';
// ** React Imports
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import Grid from '@mui/material/Grid';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/activity-check-in/TableCollapsible';
import TableHeaderMonthly from '@/views/apps/admin/reports/check-in/TableHeaderMonthly';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';
import { getThaiMonthName, getBuddhistYear } from '@/utils/datetime';
import {
  ADMIN_ACTIVITY_TYPES,
  exportAdminActivityCheckInReport,
  getActivityTypeLabel,
} from '@/views/apps/admin/reports/activity-check-in/report-utils';

const AdminActivityCheckInMonthlyReportPage = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useActivityCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );

  // ** State
  const [value, setValue] = useState<ReportCheckIn>({} as ReportCheckIn);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activityType, setActivityType] = useState<string>('CLUB');
  const [loading, setLoading] = useState<boolean>(true);

  const activityTypeLabel = getActivityTypeLabel(activityType);

  useEffect(() => {
    if (!selectedDate) return;

    const fetch = async () => {
      setLoading(true);
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      await findDailyReportAdmin({ startDate: start, endDate: end, activityType }).then(async (res: any) => {
        setValue(await res);
        setLoading(false);
      });
    };
    fetch();
  }, [activityType, selectedDate]);

  const handleSelectedDate = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleActivityTypeChange = (event: any) => {
    setActivityType(event.target.value);
  };

  const handleExportExcel = async () => {
    if (!selectedDate) {
      return;
    }

    await exportAdminActivityCheckInReport({
      report: value,
      activityType,
      reportTitle: 'รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน',
      periodLabel: `ประจำเดือน ${getThaiMonthName(selectedDate)} ${getBuddhistYear(selectedDate)}`,
      filePrefix: 'admin_activity_checkin_monthly',
    });
  };

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <BsCalendar2Date />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`รายงานสถิติการเข้าร่วม${activityTypeLabel} ของนักเรียน ทั้งหมด ${value?.students ?? 0} คน`}
            subheader={
              selectedDate ? `ประจำเดือน ${getThaiMonthName(selectedDate)} ${getBuddhistYear(selectedDate)}` : ''
            }
          />
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <TableHeaderMonthly
            value={value}
            selectedDate={selectedDate}
            handleSelectedDate={handleSelectedDate}
            activityType={activityType}
            handleActivityTypeChange={handleActivityTypeChange}
            activityTypes={ADMIN_ACTIVITY_TYPES}
            onExport={handleExportExcel}
            isExportDisabled={loading || !(value.checkIn?.length ?? 0)}
          />
          {loading ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminActivityCheckInMonthlyReportPage;
