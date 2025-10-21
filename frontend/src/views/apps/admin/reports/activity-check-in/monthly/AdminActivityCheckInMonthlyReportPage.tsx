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
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';
import { getThaiMonthName, getBuddhistYear } from '@/utils/datetime';


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

  useEffect(() => {
    if (!selectedDate) return;

    const fetch = async () => {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      await findDailyReportAdmin(storedToken, { startDate: start, endDate: end }).then(async (res: any) => {
        setValue(await res);
      });
    };
    fetch();
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
            subheader={
              selectedDate ? `ประจำเดือน ${getThaiMonthName(selectedDate)} ${getBuddhistYear(selectedDate)}` : ''
            }
          />
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <TableHeaderMonthly value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {isEmpty(value.checkIn) ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminActivityCheckInMonthlyReportPage;
