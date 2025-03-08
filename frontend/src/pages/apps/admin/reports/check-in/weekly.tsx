// ** Types Imports
import { Avatar, Card, CardHeader } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs, { Dayjs } from 'dayjs';
// ** React Imports
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/check-in/TableCollapsible';
import TableHeaderWeekly from '@/views/apps/admin/reports/check-in/TableHeaderWeekly';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useReportCheckInStore } from '@/store/index';
import { useLocalStorage } from '@/hooks/useLocalStorage';
dayjs.extend(buddhistEra);

const AdminCheckInWeeklyReport = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useReportCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );
  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;

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
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <BsCalendar2Date />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`รายงานสถิติการมาเรียนของนักเรียน ทั้งหมด ${value.students} คน`}
            subheader={`ประจำสัปดาห์ที่ ${startOfWeek.format('DD MMMM BBBB')} - ${endOfWeek.format('DD MMMM BBBB')}`}
          />
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <TableHeaderWeekly value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {isEmpty(value.checkIn) ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

AdminCheckInWeeklyReport.acl = {
  action: 'read',
  subject: 'admin-report-check-in-weekly-page',
};

export default AdminCheckInWeeklyReport;
