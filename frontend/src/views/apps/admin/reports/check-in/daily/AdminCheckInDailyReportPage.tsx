'use client';

import { Avatar, Card, CardHeader } from '@mui/material';
// ** React Imports
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import Grid from '@mui/material/Grid';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/check-in/TableCollapsible';
// ** Types Imports
import TableHeader from '@/views/apps/admin/reports/check-in/TableHeader';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useReportCheckInStore } from '@/store/index';
import { formatFullDateThai } from '@/utils/datetime';

const AdminCheckInDailyReportPage = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useReportCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );

  // ** State
  const [value, setValue] = useState<ReportCheckIn>({} as ReportCheckIn);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    if (!selectedDate) return;

    (async () => {
      await findDailyReportAdmin({ startDate: selectedDate, endDate: selectedDate }).then(async (res: any) => {
        setValue(await res);
      });
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
            title={`รายงานสถิติการมาเรียนของนักเรียน ทั้งหมด ${value?.students ?? 0} คน`}
            subheader={selectedDate ? `ประจำ${formatFullDateThai(selectedDate)}` : ''}
          />
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <TableHeader value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {isEmpty(value.checkIn) ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminCheckInDailyReportPage;
