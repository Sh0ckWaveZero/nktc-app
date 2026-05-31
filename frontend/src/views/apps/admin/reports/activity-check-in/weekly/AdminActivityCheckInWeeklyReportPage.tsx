'use client';

// ** Types Imports
import { Avatar, Card, CardHeader } from '@mui/material';
// ** React Imports
import { useEffect, useState } from 'react';
import { startOfWeek, addDays } from 'date-fns';

import { BsCalendar2Date } from 'react-icons/bs';
import Grid from '@mui/material/Grid';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/activity-check-in/TableCollapsible';
import TableHeaderWeekly from '@/views/apps/admin/reports/check-in/TableHeaderWeekly';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';
import { formatLongDateThai } from '@/utils/datetime';
import {
  ADMIN_ACTIVITY_TYPES,
  exportAdminActivityCheckInReport,
  getActivityTypeLabel,
} from '@/views/apps/admin/reports/activity-check-in/report-utils';

const AdminActivityCheckInWeeklyReportPage = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useActivityCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );

  // ** State
  const [value, setValue] = useState<ReportCheckIn>({} as ReportCheckIn);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startOfWeekDate, setStartOfWeekDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endOfWeekDate, setEndOfWeekDate] = useState<Date>(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4));
  const [activityType, setActivityType] = useState<string>('CLUB');
  const [loading, setLoading] = useState<boolean>(true);

  const activityTypeLabel = getActivityTypeLabel(activityType);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      setStartOfWeekDate(start);
      const end = addDays(start, 4); // Friday
      setEndOfWeekDate(end);
      await findDailyReportAdmin({ startDate: start, endDate: end, activityType }).then(async (res: any) => {
        setValue(await res);
        setLoading(false);
      });
    };
    fetch();
  }, [activityType, selectedDate]);

  const handleSelectedDate = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleActivityTypeChange = (event: any) => {
    setActivityType(event.target.value);
  };

  const handleExportExcel = async () => {
    await exportAdminActivityCheckInReport({
      report: value,
      activityType,
      reportTitle: 'รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน',
      periodLabel: `สัปดาห์ที่ ${formatLongDateThai(startOfWeekDate)} - ${formatLongDateThai(endOfWeekDate)}`,
      filePrefix: 'admin_activity_checkin_weekly',
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
            subheader={`ประจำสัปดาห์ที่ ${formatLongDateThai(startOfWeekDate)} - ${formatLongDateThai(endOfWeekDate)}`}
          />
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <TableHeaderWeekly
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

export default AdminActivityCheckInWeeklyReportPage;
