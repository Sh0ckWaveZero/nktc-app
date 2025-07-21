'use client';

import 'dayjs/locale/th';

// ** Types Imports
import { Avatar, Card, CardHeader } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
// ** React Imports
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import Grid from '@mui/material/Grid';
import { LocalStorageService } from '@/services/localStorageService';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/activity-check-in/TableCollapsible';
import TableHeaderWeekly from '@/views/apps/admin/reports/check-in/TableHeaderWeekly';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';

dayjs.locale('th');
dayjs.extend(buddhistEra);

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
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(new Date()));
  const [startOfWeek, setStartOfWeek] = useState<Dayjs>(dayjs(new Date()).startOf('week').add(1, 'day'));
  const [endOfWeek, setEndOfWeek] = useState<Dayjs>(dayjs(new Date()).endOf('week').subtract(1, 'day'));

  useEffect(() => {
    const fetch = async () => {
      const start = selectedDate.startOf('week').add(1, 'day');
      setStartOfWeek(start);
      const end = selectedDate.endOf('week').subtract(1, 'day');
      setEndOfWeek(end);
      await findDailyReportAdmin(storedToken, { startDate: start, endDate: end }).then(async (res: any) => {
        setValue(await res);
      });
    };
    fetch();
  }, [selectedDate]);

  const handleSelectedDate = (date: Dayjs | null) => {
    setSelectedDate(date as Dayjs);
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
            title={`รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน ทั้งหมด ${value.students} คน`}
            subheader={`ประจำสัปดาห์ที่ ${startOfWeek.format('DD MMMM BBBB')} - ${endOfWeek.format('DD MMMM BBBB')}`}
          />
        </Card>
      </Grid>
      <Grid size={12}>
        <Card>
          <TableHeaderWeekly value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {isEmpty(value.checkIn) ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminActivityCheckInWeeklyReportPage;