'use client';

// ** Types Imports
import { Avatar, Card, CardHeader } from '@mui/material';
// ** React Imports
import { useEffect, useState } from 'react';
import { startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';

import { BsCalendar2Date } from 'react-icons/bs';
import Grid from '@mui/material/Grid';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/check-in/TableCollapsible';
import TableHeaderWeekly from '@/views/apps/admin/reports/check-in/TableHeaderWeekly';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useReportCheckInStore } from '@/store/index';
import { formatLongDateThai } from '@/utils/datetime';


const AdminCheckInWeeklyReportPage = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useReportCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );

  // ** State
  const [value, setValue] = useState<ReportCheckIn>({} as ReportCheckIn);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startOfWeekDate, setStartOfWeekDate] = useState<Date>(
    addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0),
  );
  const [endOfWeekDate, setEndOfWeekDate] = useState<Date>(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4));

  useEffect(() => {
    const fetch = async () => {
      const start = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 0);
      setStartOfWeekDate(start);
      const end = addDays(start, 4); // Friday
      setEndOfWeekDate(end);
      await findDailyReportAdmin(storedToken, { startDate: start, endDate: end }).then(async (res: any) => {
        setValue(await res);
      });
    };
    fetch();
  }, [selectedDate]);

  const handleSelectedDate = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'second.main' }} aria-label='recipe'>
                <BsCalendar2Date />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`รายงานสถิติการมาเรียนของนักเรียน ทั้งหมด ${value?.students ?? 0} คน`}
            subheader={`ประจำสัปดาห์ที่ ${formatLongDateThai(startOfWeekDate)} - ${formatLongDateThai(endOfWeekDate)}`}
          />
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <TableHeaderWeekly selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {isEmpty(value.checkIn) ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminCheckInWeeklyReportPage;
