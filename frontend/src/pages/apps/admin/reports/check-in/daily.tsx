// ** React Imports
import { useState, useEffect, useCallback } from 'react';
// ** Types Imports
import TableHeader from '@/views/apps/admin/reports/check-in/TableHeader';
import { Avatar, Card, CardHeader, Grid, SelectChangeEvent } from '@mui/material';
import { BsCalendar2Date } from 'react-icons/bs';
import TableDaily from '@/views/apps/admin/reports/check-in/TableDaily';
import { useReportCheckInStore, useUserStore } from '@/store/index';
import shallow from 'zustand/shallow';
import { Subjects } from '../../../../../configs/acl';

const AdminCheckInDailyReport = () => {
  // ** Store Vars
  const { findDailyReportAdmin } = useReportCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );

  const { accessToken } = useUserStore(
    (state: any) => ({
      accessToken: state.accessToken,
    }),
    shallow,
  );

  // ** State
  const [value, setValue] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date() || null);

  useEffect(() => {
    const fetch = async () => {
      await findDailyReportAdmin(accessToken, { startDate: selectedDate, endDate: selectedDate }).then(
        async (res: any) => {
          setValue(await res);
        },
      );
    };
    fetch();
  }, [selectedDate]);

  const handleSelectedDate = (date: Date | null) => {
    setSelectedDate(date as Date);
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
            subheader={`ประจำ${new Date().toLocaleDateString('th-TH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeader value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          <TableDaily values={value} />
        </Card>
      </Grid>
    </Grid>
  );
};

AdminCheckInDailyReport.acl = {
  action: 'read',
  subject: 'admin-report-check-in-daily-page',
};

export default AdminCheckInDailyReport;
