// ** React Imports
import { useState, useEffect } from 'react';
// ** Types Imports
import { Avatar, Card, CardHeader, Grid } from '@mui/material';
import { BsCalendar2Date } from 'react-icons/bs';
import TableDaily from '@/views/apps/admin/reports/check-in/TableDaily';
import { useReportCheckInStore, useUserStore } from '@/store/index';
import shallow from 'zustand/shallow';
import TableHeaderWeekly from '@/views/apps/admin/reports/check-in/TableHeaderWeekly';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
dayjs.locale('th');

const AdminCheckInWeeklyReport = () => {
  // ** Store Vars
  const { findDailyReportAdmin } = useReportCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );

  const { accessToken } = useUserStore(
    (state) => ({
      accessToken: state.accessToken,
    }),
    shallow,
  );

  // ** State
  const [value, setValue] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(new Date()));
  const [startOfWeek, setStartOfWeek] = useState<Dayjs>(dayjs(new Date()).startOf('week').add(1, 'day'));
  const [endOfWeek, setEndOfWeek] = useState<Dayjs>(dayjs(new Date()).endOf('week').subtract(1, 'day'));

  useEffect(() => {
    const fetch = async () => {
      const start = selectedDate.startOf('week').add(1, 'day');
      setStartOfWeek(start);
      const end = selectedDate.endOf('week').subtract(1, 'day');
      setEndOfWeek(end);
      await findDailyReportAdmin(accessToken, { startDate: start, endDate: end }).then(async (res: any) => {
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
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <BsCalendar2Date />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`รายงานสถิติการมาเรียนของนักเรียน`}
            subheader={`ประจำสัปดาห์ที่ ${startOfWeek.format('DD MMMM BBBB')} - ${endOfWeek.format('DD MMMM BBBB')}`}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeaderWeekly value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          <TableDaily values={value} />
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
