// ** React Imports
import { useState, useEffect } from 'react';
// ** Types Imports
import { Avatar, Card, CardHeader, Grid } from '@mui/material';
import { BsCalendar2Date } from 'react-icons/bs';
import TableCollapsible from '@/views/apps/admin/reports/check-in/TableCollapsible';
import { useReportCheckInStore } from '@/store/index';
import { shallow } from 'zustand/shallow';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import TableHeaderMonthly from '@/views/apps/admin/reports/check-in/TableHeaderMonthly';
import { LocalStorageService } from '@/services/localStorageService';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import { isEmpty } from '@/@core/utils/utils';
dayjs.locale('th');

const localStorageService = new LocalStorageService();

const AdminCheckInMonthlyReport = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useReportCheckInStore(
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
            title={`รายงานสถิติการมาเรียนของนักเรียน ทั้งหมด ${value.students} คน`}
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

AdminCheckInMonthlyReport.acl = {
  action: 'read',
  subject: 'admin-report-check-in-monthly-page',
};

export default AdminCheckInMonthlyReport;
