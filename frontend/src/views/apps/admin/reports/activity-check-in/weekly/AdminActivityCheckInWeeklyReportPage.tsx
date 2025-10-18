'use client';

// ** Types Imports
import { Avatar, Card, CardHeader } from '@mui/material';
// ** React Imports
import { useEffect, useState } from 'react';
import { startOfWeek, addDays } from 'date-fns';

import { BsCalendar2Date } from 'react-icons/bs';
import Grid from '@mui/material/Grid';
import { LocalStorageService } from '@/services/localStorageService';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/activity-check-in/TableCollapsible';
import TableHeaderWeekly from '@/views/apps/admin/reports/check-in/TableHeaderWeekly';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';
import { formatLongDateThai } from '@/utils/datetime';

const localStorageService = new LocalStorageService();

const AdminActivityCheckInWeeklyReportPage = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useActivityCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );
  const storedToken = localStorageService.getToken() || '';

  // ** State
  const [value, setValue] = useState<ReportCheckIn>({} as ReportCheckIn);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startOfWeekDate, setStartOfWeekDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endOfWeekDate, setEndOfWeekDate] = useState<Date>(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4));

  useEffect(() => {
    const fetch = async () => {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
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
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <BsCalendar2Date />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน ทั้งหมด ${value?.students ?? 0} คน`}
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

export default AdminActivityCheckInWeeklyReportPage;
