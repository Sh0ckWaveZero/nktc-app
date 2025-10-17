'use client';

import { Avatar, Card, CardHeader } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import Grid from '@mui/material/Grid';
import { LocalStorageService } from '@/services/localStorageService';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/activity-check-in/TableCollapsible';
import TableHeader from '@/views/apps/admin/reports/check-in/TableHeader';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';
import { formatFullDateThai } from '@/utils/datetime';

const localStorageService = new LocalStorageService();

const AdminActivityCheckInDailyReportPage = () => {
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
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    (async () => {
      await findDailyReportAdmin(storedToken, { startDate: selectedDate, endDate: selectedDate }).then(
        async (res: any) => {
          setValue(await res);
        },
      );
    })();
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
            title={`รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน ทั้งหมด ${value?.students ?? 0} คน`}
            subheader={`ประจำ${formatFullDateThai(selectedDate.toDate())}`}
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

export default AdminActivityCheckInDailyReportPage;