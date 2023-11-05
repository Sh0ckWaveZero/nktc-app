import 'dayjs/locale/th';

// ** Types Imports
import { Avatar, Card, CardHeader, Grid } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
// ** React Imports
import { useEffect, useState } from 'react';

import { BsCalendar2Date } from 'react-icons/bs';
import { ReportCheckIn } from '@/types/apps/reportCheckIn';
import Spinner from '@/@core/components/spinner';
import TableHeaderWeekly from '@/views/apps/reports/student/TableHeaderWeekly';
import TableSpanning from '@/views/apps/reports/student/TableSpanning';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { shallow } from 'zustand/shallow';
import { useAuth } from '@/hooks/useAuth';
import useGetFullNameWithTitle from '@/hooks/useFullNameWithTitle';
import { useReportCheckInStore } from '@/store/index';
import { useLocalStorage } from '@/hooks/useLocalStorage';

dayjs.locale('th');
dayjs.extend(buddhistEra);

const StudentCheckInReport = () => {
  const { user } = useAuth();
  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;
  const { fullName } = useGetFullNameWithTitle({ user } as any);

  // ** Store Vars
  const { findStudentWeeklyReport }: any = useReportCheckInStore(
    (state) => ({
      findStudentWeeklyReport: state.findStudentWeeklyReport,
    }),
    shallow,
  );

  // ** State
  const [value, setValue] = useState<ReportCheckIn>({} as ReportCheckIn);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(new Date()));
  const [startOfWeek, setStartOfWeek] = useState<Dayjs>(dayjs(new Date()).startOf('week').add(1, 'day'));
  const [endOfWeek, setEndOfWeek] = useState<Dayjs>(dayjs(new Date()).endOf('week').subtract(1, 'day'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const start = selectedDate.startOf('week').add(1, 'day');
      setStartOfWeek(start);
      const end = selectedDate.endOf('week').subtract(1, 'day');
      setEndOfWeek(end);
      await findStudentWeeklyReport(storedToken, {
        studentId: user?.id,
        classroomId: user?.student?.classroom?.id,
        start,
        end,
      }).then(async (res: any) => {
        setValue(await res);
        setLoading(false);
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
            title={`รายงานการเช็คชื่อของ ${fullName} ชั้น ${user?.student?.classroom?.name} `}
            subheader={`ประจำสัปดาห์ที่ ${startOfWeek.format('DD MMMM BBBB')} - ${endOfWeek.format('DD MMMM BBBB')}`}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeaderWeekly selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          {loading ? <Spinner /> : <TableSpanning value={value} />}
        </Card>
      </Grid>
    </Grid>
  );
};

StudentCheckInReport.acl = {
  action: 'read',
  subject: 'student-check-in-report',
};

export default StudentCheckInReport;
