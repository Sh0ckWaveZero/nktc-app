// ** React Imports
import { useState, useEffect } from 'react';
// ** Types Imports
import TableHeader from '@/views/apps/admin/reports/check-in/TableHeader';
import { Avatar, Card, CardHeader, Grid } from '@mui/material';
import { BsCalendar2Date } from 'react-icons/bs';
import TableCollapsible from '@/views/apps/admin/reports/check-in/TableCollapsible';
import { useReportCheckInStore } from '@/store/index';
import shallow from 'zustand/shallow';
import { LocalStorageService } from '@/services/localStorageService';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import { isEmpty } from '@/@core/utils/utils';
import Spinner from '@/@core/components/spinner';
import dayjs, { Dayjs } from 'dayjs';
dayjs.locale('th');

const localStorageService = new LocalStorageService();

const AdminCheckInDailyReport = () => {
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
  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()) || null);

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
            subheader={`ประจำ${selectedDate.format('dddที่ DD MMMM BBBB')}`}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeader value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {isEmpty(value.checkIn) ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
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
