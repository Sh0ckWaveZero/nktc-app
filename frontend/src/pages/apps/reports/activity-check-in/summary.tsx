// ** React Imports
import { Fragment, useContext, useState } from 'react';

// ** MUI Imports
import { Typography, CardHeader, Card, Grid, Avatar } from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';

// ** Store Imports
import { useReportCheckInStore, useClassroomStore, useActivityCheckInStore } from '@/store/index';

// ** Custom Components Imports
import { useEffectOnce } from '@/hooks/userCommon';

// ** Config
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { isEmpty } from '@/@core/utils/utils';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useRouter } from 'next/router';
import { BsBarChartLine } from 'react-icons/bs';
import TableHeaderSummary from '@/views/apps/reports/activity-check-in/TableHeaderSummary';
import { useAuth } from '@/hooks/useAuth';
import { shallow } from 'zustand/shallow';
import { LocalStorageService } from '@/services/localStorageService';
import toast from 'react-hot-toast';

interface CellType {
  // row: teachersTypes;
  row: any;
}
const localStorageService = new LocalStorageService();

const SummaryCheckInReportActivity = () => {
  // ** Hooks
  const auth = useAuth();
  const accessToken = localStorageService.getToken()!;
  const ability = useContext(AbilityContext);
  const router = useRouter();

  // ** Store Vars
  const { fetchTeachClassroom }: any = useClassroomStore(
    (state) => ({
      fetchTeachClassroom: state.fetchTeachClassroom,
    }),
    shallow,
  );
  const { findSummaryReport }: any = useActivityCheckInStore(
    (state) => ({
      findSummaryReport: state.findSummaryReport,
    }),
    shallow,
  );

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(isEmpty(currentStudents) ? 0 : currentStudents.length);
  const [classroomName, setClassroomName] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [selectedDate, setDateSelected] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(true);

  // ดึงข้อมูลห้องเรียนของครู
  useEffectOnce(() => {
    const fetch = async () => {
      fetchTeachClassroom(accessToken, auth?.user?.teacher?.id as string).then(async (result: any) => {
        setClassroomName((await result) ? result[0] : []);
        setClassrooms((await result) ? result : []);
        await fetchDailyReport((await result) ? result[0].id : {});
      });
    };
    // check permission
    if (ability?.can('read', 'summary-check-in-report-activity-page') && auth?.user?.role !== 'Admin') {
      // check teacher on classroom
      if (isEmpty(auth?.user?.teacherOnClassroom)) {
        toast.error('ไม่พบข้อมูลที่ปรีกษาประจำชั้น');
        router.push('/pages/account-settings');
        return;
      }
      fetch();
    } else {
      router.push('/401');
    }
  });

  const fetchDailyReport = async (classroom: any = '') => {
    setLoading(true);
    await findSummaryReport(accessToken, {
      teacherId: auth?.user?.teacher?.id,
      classroomId: classroom ? classroom : classroomName.id,
    }).then(async (data: any) => {
      setCurrentStudents(await data);
      setLoading(false);
    });
  };

  const ccyFormat = (num: number) => {
    return `${isNaN(num) || isEmpty(num) ? '0.00' : num.toFixed(2)}`;
  };

  const columns: GridColumns = [
    {
      flex: 0.13,
      minWidth: 130,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { student } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {student.studentId}
          </Typography>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 200,
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { account } = row;
        const fullName = `${account.title}${account?.firstName} ${account?.lastName}`;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {fullName}
          </Typography>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 60,
      field: 'present',
      headerName: 'เข้าร่วม',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { present } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'success.dark', textDecoration: 'none' }}
          >
            {present}
          </Typography>
        );
      },
    },
    {
      flex: 0.13,
      minWidth: 70,
      field: 'presentPercent',
      headerName: 'เข้าร่วม(%)',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { presentPercent } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'success.dark', textDecoration: 'none' }}
          >
            {ccyFormat(presentPercent)}
          </Typography>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 60,
      field: 'absent',
      headerName: 'ไม่เข้าร่วม',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { absent } = row;
        return (
          <Typography noWrap variant='subtitle2' sx={{ fontWeight: 400, color: 'error.dark', textDecoration: 'none' }}>
            {absent}
          </Typography>
        );
      },
    },
    {
      flex: 0.13,
      minWidth: 70,
      field: 'absentPercent',
      headerName: 'ไม่เข้าร่วม(%)',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { absentPercent } = row;
        return (
          <Typography noWrap variant='subtitle2' sx={{ fontWeight: 400, color: 'error.dark', textDecoration: 'none' }}>
            {ccyFormat(absentPercent)}
          </Typography>
        );
      },
    },
    {
      flex: 0.12,
      minWidth: 80,
      field: 'checkInTotal',
      headerName: 'รวมทั้งหมด',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { checkInTotal } = row;
        return (
          <Typography noWrap variant='subtitle2' sx={{ fontWeight: 400, color: 'info.dark', textDecoration: 'none' }}>
            {checkInTotal}
          </Typography>
        );
      },
    },
  ];

  const handleDateChange = async (date: Date | null) => {
    setDateSelected(date);
    await fetchDailyReport(date);
  };

  const handleSelectChange = async (event: any) => {
    event.preventDefault();
    const {
      target: { value },
    } = event;
    const classroomName: any = classrooms.filter((item: any) => item.name === value)[0];
    setLoading(true);
    setClassroomName(classroomName);
    await fetchDailyReport(classroomName.id);
  };

  return (
    ability?.can('read', 'report-check-in-summary-page') &&
    auth?.user?.role !== 'Admin' && (
      <Fragment>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <BsBarChartLine />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`รายงานสรุปการเช็คชื่อกิจกรรม ชั้น ${classroomName?.name}`}
              />

              <TableHeaderSummary
                students={currentStudents}
                classrooms={classrooms}
                handleChange={handleSelectChange}
                defaultValue={classroomName?.name}
                selectedDate={selectedDate}
                handleDateChange={handleDateChange}
                isDisabled={isEmpty(currentStudents)}
              />
              <DataGrid
                autoHeight
                columns={columns}
                rows={currentStudents ?? []}
                disableColumnMenu
                headerHeight={150}
                loading={loading}
                rowHeight={isEmpty(currentStudents) ? 100 : 50}
                rowsPerPageOptions={[pageSize]}
                onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
                components={{
                  NoRowsOverlay: CustomNoRowsOverlay,
                }}
                sx={{ overflowX: 'auto' }}
              />
            </Card>
          </Grid>
        </Grid>
      </Fragment>
    )
  );
};

SummaryCheckInReportActivity.acl = {
  action: 'read',
  subject: 'summary-check-in-report-activity-page',
};

export default SummaryCheckInReportActivity;