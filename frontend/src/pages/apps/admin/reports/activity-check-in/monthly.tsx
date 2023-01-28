import 'dayjs/locale/th';

// ** Types Imports
import { Avatar, Card, CardHeader, Grid } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
// ** React Imports
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import { LocalStorageService } from '@/services/localStorageService';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableHeaderMonthly from '@/views/apps/admin/reports/check-in/TableHeaderMonthly';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';
import TableCollapsible from '@/views/apps/admin/reports/activity-check-in/TableCollapsible';

dayjs.locale('th');

const localStorageService = new LocalStorageService();

const AdminCheckActivityInMonthlyReport = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useActivityCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );

  const storedToken = localStorageService.getToken()!;

  // ** State
  const [value, setValue] = useState<ReportCheckIn>({} as ReportCheckIn);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(new Date()));

  useEffect(() => {
    const fetch = async () => {
      const start = selectedDate.startOf('month');
      const end = selectedDate.endOf('month');
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
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <BsCalendar2Date />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน ทั้งหมด ${value.students} คน`}
            subheader={`ประจำเดือน ${selectedDate.format('MMMM BBBB')}`}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeaderMonthly value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {isEmpty(value.checkIn) ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

AdminCheckActivityInMonthlyReport.acl = {
  action: 'read',
  subject: 'admin-activity-check-in-page',
};

export default AdminCheckActivityInMonthlyReport;
