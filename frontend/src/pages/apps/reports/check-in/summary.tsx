// ** React Imports
import { useContext, useState } from 'react';

// ** MUI Imports
import { Typography, CardHeader, Card, Grid, Avatar } from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';

// ** Store Imports
import { useUserStore, useReportCheckInStore, useClassroomStore } from '@/store/index';

// ** Custom Components Imports
import { useEffectOnce } from '@/hooks/userCommon';

// ** Config
import { Toaster } from 'react-hot-toast';
import ReactHotToast from '@/@core/styles/libs/react-hot-toast';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { isEmpty } from '@/@core/utils/utils';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useRouter } from 'next/router';
import { BsBarChartLine } from 'react-icons/bs';
import TableHeaderSummary from '@/views/apps/reports/check-in/TableHeaderSummary';

interface CellType {
  // row: teachersTypes;
  row: any;
}

const ReportCheckInDaily = () => {
  // ** Hooks
  const { fetchTeachClassroom } = useClassroomStore();
  const { userInfo, accessToken } = useUserStore();
  const { findSummaryReport, updateReportCheckIn, removeReportCheckIn } = useReportCheckInStore();
  const ability = useContext(AbilityContext);
  const router = useRouter();

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
      fetchTeachClassroom(accessToken, userInfo?.teacher?.id).then(async (result: any) => {
        setClassroomName((await result) ? result[0] : []);
        setClassrooms((await result) ? result : []);
        await fetchDailyReport((await result) ? result[0].id : {});
      });
    };
    // check permission
    if (ability?.can('read', 'report-check-in-daily-page') && userInfo.role !== 'Admin') {
      fetch();
    } else {
      router.push('/401');
    }
  });

  const fetchDailyReport = async (classroom: any = '') => {
    setLoading(true);
    await findSummaryReport(accessToken, {
      teacherId: userInfo?.teacher?.id,
      classroomId: classroom ? classroom : classroomName.id,
    }).then(async (data: any) => {
      setCurrentStudents(await data);
      setLoading(false);
    });
  };

  const ccyFormat = (num: number) => {
    return `${isNaN(num) ? '0.00' : num.toFixed(2)}`;
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
      headerName: 'มาเรียน',
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
      headerName: 'มาเรียน(%)',
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
      headerName: 'ขาดเรียน',
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
      headerName: 'ขาดเรียน(%)',
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
      flex: 0.1,
      minWidth: 60,
      field: 'leave',
      headerName: 'ลา',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { leave } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'secondary.dark', textDecoration: 'none' }}
          >
            {leave}
          </Typography>
        );
      },
    },
    {
      flex: 0.13,
      minWidth: 70,
      field: 'leavePercent',
      headerName: 'ลา(%)',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { leavePercent } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'secondary.dark', textDecoration: 'none' }}
          >
            {ccyFormat(leavePercent)}
          </Typography>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 60,
      field: 'late',
      headerName: 'มาสาย',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { late } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'warning.dark', textDecoration: 'none' }}
          >
            {late}
          </Typography>
        );
      },
    },
    {
      flex: 0.13,
      minWidth: 70,
      field: 'latePercent',
      headerName: 'มาสาย(%)',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { latePercent } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'warning.dark', textDecoration: 'none' }}
          >
            {ccyFormat(latePercent)}
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
    userInfo.role !== 'Admin' && (
      <>
        <ReactHotToast>
          <Toaster position='top-right' reverseOrder={false} toastOptions={{ className: 'react-hot-toast' }} />
        </ReactHotToast>

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
                title={`รายงานสรุปการเช็คชื่อ กิจกรรมหน้าเสาธง ชั้น ${classroomName?.name}`}
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
              />
            </Card>
          </Grid>
        </Grid>
      </>
    )
  );
};

ReportCheckInDaily.acl = {
  action: 'read',
  subject: 'report-check-in-summary-page',
};

export default ReportCheckInDaily;
