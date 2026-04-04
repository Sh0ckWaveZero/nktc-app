'use client';

import { Avatar, Card, CardHeader } from '@mui/material';
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import Grid from '@mui/material/Grid';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/activity-check-in/TableCollapsible';
import TableHeader from '@/views/apps/admin/reports/check-in/TableHeader';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';
import { formatFullDateThai } from '@/utils/datetime';

const AdminActivityCheckInDailyReportPage = () => {
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!selectedDate) return;

    setLoading(true);
    (async () => {
      const res = await findDailyReportAdmin({ startDate: selectedDate, endDate: selectedDate });
      setValue(res ?? {});
      setLoading(false);
    })();
  }, [selectedDate]);

  const handleSelectedDate = (date: Date | null) => {
    setSelectedDate(date);
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
            title={`รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน ทั้งหมด ${value?.students ?? 0} คน`}
            subheader={selectedDate ? `ประจำ${formatFullDateThai(selectedDate)}` : ''}
          />
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <TableHeader value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {loading ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminActivityCheckInDailyReportPage;
