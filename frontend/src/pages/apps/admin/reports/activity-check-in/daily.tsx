import { Avatar, Card, CardHeader } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableCollapsible from '@/views/apps/admin/reports/activity-check-in/TableCollapsible';
import TableHeader from '@/views/apps/admin/reports/check-in/TableHeader';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { useActivityCheckInStore } from '@/store/index';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Grid from '@mui/material/Grid2';

dayjs.locale('th');
dayjs.extend(buddhistEra);

const AdminActivityCheckInDailyReport = () => {
  // ** Store Vars
  const { findDailyReportAdmin }: any = useActivityCheckInStore(
    (state) => ({
      findDailyReportAdmin: state.findDailyReportAdmin,
    }),
    shallow,
  );

  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;

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
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <BsCalendar2Date />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`รายงานสถิติการเข้าร่วมกิจกรรมของนักเรียน ทั้งหมด ${value.students} คน`}
            subheader={`ประจำ${selectedDate.format('dddที่ DD MMMM BBBB')}`}
          />
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <TableHeader value={value} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {isEmpty(value.checkIn) ? <Spinner /> : <TableCollapsible values={value.checkIn ?? []} />}
        </Card>
      </Grid>
    </Grid>
  );
};

AdminActivityCheckInDailyReport.acl = {
  action: 'read',
  subject: 'admin-activity-check-in-page',
};

export default AdminActivityCheckInDailyReport;
