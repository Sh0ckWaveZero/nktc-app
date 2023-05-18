// ** React Imports
import { useContext, useState, Fragment } from 'react';

// ** MUI Imports
import {
  Typography,
  CardHeader,
  Card,
  Grid,
  Avatar,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  styled,
  alpha,
} from '@mui/material';
import { DataGrid, gridClasses, GridColumns } from '@mui/x-data-grid';

// ** Custom Components Imports
import CustomChip from '@/@core/components/mui/chip';

// ** Store Imports
import { useReportCheckInStore, useClassroomStore } from '@/store/index';

// ** Custom Components Imports
import { useEffectOnce } from '@/hooks/userCommon';

// ** Config
import toast from 'react-hot-toast';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { isEmpty } from '@/@core/utils/utils';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useRouter } from 'next/router';
import { BsCalendar2Date } from 'react-icons/bs';
import TableHeaderDaily from '@/views/apps/reports/check-in/TableHeaderDaily';
import {
  AccountCancelOutline,
  AccountCheckOutline,
  AccountClockOutline,
  AccountEditOutline,
  AccountFilterOutline,
  AccountLockOutline,
  AlertOctagramOutline,
} from 'mdi-material-ui';
import SidebarEditCheckInDrawer from '@/views/apps/reports/check-in/EditCheckInDrawer';
import { shallow } from 'zustand/shallow';
import { useAuth } from '@/hooks/useAuth';
import { LocalStorageService } from '@/services/localStorageService';

interface CellType {
  // row: teachersTypes;
  row: any;
}

type StudentStatus = 'present' | 'absent' | 'late' | 'leave' | 'internship';

// ** Vars
const checkInStatueIcon: any = {
  present: <AccountCheckOutline />,
  absent: <AccountCancelOutline />,
  late: <AccountClockOutline />,
  leave: <AccountFilterOutline />,
  notCheckIn: <AlertOctagramOutline />,
  none: <AlertOctagramOutline />,
  internship: <AccountLockOutline />,
};

const checkInStatueColor: any = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  leave: 'info',
  notCheckIn: 'error',
  none: 'error',
  internship: 'secondary',
};

const checkInStatueName: any = {
  present: 'มาเรียน',
  absent: 'ขาดเรียน',
  late: 'มาสาย',
  leave: 'ลา',
  notCheckIn: 'ยังไม่เช็คชื่อ',
  none: 'ยังไม่เช็คชื่อ',
  internship: 'นักศึกษาฝึกงาน',
};

const localStorageService = new LocalStorageService();

const NORMAL_OPACITY = 0.2;
const DataGridCustom = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.internship`]: {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
    '&:hover, &.Mui-hovered': {
      backgroundColor: alpha(theme.palette.primary.main, NORMAL_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, NORMAL_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover, &.Mui-hovered': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          NORMAL_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, NORMAL_OPACITY + theme.palette.action.selectedOpacity),
        },
      },
    },
  },
}));

const ReportCheckInDaily = () => {
  // ** Local variable
  let isPresentCheck: any[] = [];
  let isAbsentCheck: any[] = [];
  let isLateCheck: any[] = [];
  let isLeaveCheck: any[] = [];
  let isInternshipCheck: any[] = [];

  // const [isPresentCheck, setIsPresentCheck] = useState<any[]>([]);
  // const [isAbsentCheck, setIsAbsentCheck] = useState<any[]>([]);
  // const [isLateCheck, setIsLateCheck] = useState<any[]>([]);
  // const [isLeaveCheck, setIsLeaveCheck] = useState<any[]>([]);
  // const [isInternshipCheck, setIsInternshipCheck] = useState<any[]>([]);

  // ** Hooks
  const auth = useAuth();
  const storedToken = localStorageService.getToken()!;

  const { fetchTeachClassroom }: any = useClassroomStore(
    (state) => ({
      fetchTeachClassroom: state.fetchTeachClassroom,
    }),
    shallow,
  );

  const { getReportCheckIn, findDailyReport, updateReportCheckIn, removeReportCheckIn, addReportCheckIn }: any =
    useReportCheckInStore(
      (state) => ({
        getReportCheckIn: state.getReportCheckIn,
        findDailyReport: state.findDailyReport,
        updateReportCheckIn: state.updateReportCheckIn,
        removeReportCheckIn: state.removeReportCheckIn,
        addReportCheckIn: state.addReportCheckIn,
      }),
      shallow,
    );
  const ability = useContext(AbilityContext);
  const router = useRouter();

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(isEmpty(currentStudents) ? 0 : currentStudents.length);
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [selectedDate, setDateSelected] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [reportCheckInData, setReportCheckInData] = useState<any>(null);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState<boolean>(false);

  // ดึงข้อมูลห้องเรียนของครู
  useEffectOnce(() => {
    const fetchData = async () => {
      try {
        let classroomsInfo = [];
        const errorMessage = 'ไม่พบข้อมูลที่ปรีกษาประจำชั้น';
        const redirectTo = '/pages/account-settings';
        if (ability?.can('read', 'report-check-in-daily-page') && (auth?.user?.role as string) !== 'Admin') {
          if (isEmpty(auth?.user?.teacherOnClassroom)) {
            toast.error(errorMessage);
            router.push(redirectTo);
            return;
          }

          classroomsInfo = await fetchTeachClassroom(storedToken, auth?.user?.teacher?.id);

          if (isEmpty(classroomsInfo)) {
            toast.error(errorMessage);
            router.push(redirectTo);
            return;
          }

          await fetchDailyReport(null, classroomsInfo[0]?.id);
        } else {
          router.push('/401');
          return;
        }

        const classrooms = classroomsInfo || [];
        setDefaultClassroom(classrooms[0]);
        setClassrooms(classrooms);
      } catch (error) {
        toast.error('error');
      }
    };
    fetchData();
  });

  const fetchDailyReport = async (date: Date | null = null, classroom: any = '') => {
    setLoading(true);
    const classroomInfo = classroom || defaultClassroom.id;
    const dateInfo = date || selectedDate;

    try {
      const data = await findDailyReport(storedToken, {
        teacherId: auth?.user?.teacher?.id,
        classroomId: classroomInfo,
        startDate: dateInfo,
      });

      const reportCheckInData = data.find((item: any) => item.id === classroomInfo);
      const students = reportCheckInData?.students ?? [];
      setCurrentStudents(students);
      setReportCheckInData(reportCheckInData?.reportCheckIn ?? null);
      getReportCheckIn(storedToken, {
        teacher: auth?.user?.teacher?.id,
        classroom: classroomInfo,
      });
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const onHandleToggle = (action: StudentStatus, param: any): void => {
    switch (action) {
      case 'present':
        handleTogglePresent(param);
        break;
      case 'absent':
        handleToggleAbsent(param);
        break;
      case 'late':
        handleToggleLate(param);
        break;
      case 'leave':
        handleToggleLeave(param);
        break;
      case 'internship':
        handleToggleInternship(param);
        break;
    }

    onRemoveToggleOthers(action, param);
  };

  const handleTogglePresent = (param: any): void => {
    isPresentCheck.push(...onSetToggle(isPresentCheck, param));
  };

  const handleToggleAbsent = (param: any): void => {
    isAbsentCheck.push(...onSetToggle(isAbsentCheck, param));
  };

  const handleToggleLate = (param: any): void => {
    isLateCheck.push(...onSetToggle(isLateCheck, param));
  };

  const handleToggleLeave = (param: any): void => {
    isLeaveCheck.push(...onSetToggle(isLeaveCheck, param));
  };

  const handleToggleInternship = (param: any): void => {
    isInternshipCheck.push(...onSetToggle(isInternshipCheck, param));
  };

  const onSetToggle = (prevState: any, param: any): any => {
    const { id } = param;
    const index = prevState.indexOf(id);

    let newSelection = [...prevState];

    if (index === -1) {
      newSelection.push(id);
    } else {
      newSelection = newSelection.filter((item) => item !== id);
    }

    return newSelection;
  };

  const onRemoveToggleOthers = (action: StudentStatus, param: any): void => {
    switch (action) {
      case 'present':
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        onHandleInternshipChecked(param);
        break;
      case 'absent':
        onHandlePresentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        onHandleInternshipChecked(param);
        break;
      case 'late':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLeaveChecked(param);
        onHandleInternshipChecked(param);
        break;
      case 'leave':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleInternshipChecked(param);
        break;
      case 'internship':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        break;
      default:
        break;
    }
  };

  const onHandlePresentChecked = (param: any): void => {
    if (isPresentCheck.includes(param.id)) {
      isPresentCheck = onRemoveToggle(isPresentCheck, param);
    }
  };

  const onHandleAbsentChecked = (param: any): void => {
    if (isAbsentCheck.includes(param.id)) {
      isAbsentCheck = onRemoveToggle(isAbsentCheck, param);
    }
  };

  const onHandleLateChecked = (param: any): void => {
    if (isLateCheck.includes(param.id)) {
      isLateCheck = onRemoveToggle(isLateCheck, param);
    }
  };

  const onHandleLeaveChecked = (param: any): void => {
    if (isLeaveCheck.includes(param.id)) {
      isLeaveCheck = onRemoveToggle(isLeaveCheck, param);
    }
  };

  const onHandleInternshipChecked = (param: any): void => {
    if (isInternshipCheck.includes(param.id)) {
      isInternshipCheck = onRemoveToggle(isInternshipCheck, param);
    }
  };

  const onRemoveToggle = (prevState: any, param: any): any => {
    const index = prevState.indexOf(param.id);

    if (index === -1) {
      return prevState;
    }

    return [...prevState.slice(0, index), ...prevState.slice(index + 1)];
  };

  const onClearAll = (): void => {
    isPresentCheck = [];
    isAbsentCheck = [];
    isLateCheck = [];
    isLeaveCheck = [];
  };

  const handleOpenEditCheckIn = (param: any): void => {
    setSelectedStudent(param);
    setOpenEditDrawer(true);
  };

  const onSubmittedCheckIn = async (event: any, values: any): Promise<void> => {
    event.preventDefault();
    const classroomId = values?.data?.classroomName?.id;
    const { reportCheckInData } = values?.data || {};
    const { present = [], absent = [], late = [], leave = [], internship = [] } = reportCheckInData || {};
    isPresentCheck.push(...present);
    isAbsentCheck.push(...absent);
    isLateCheck.push(...late);
    isLeaveCheck.push(...leave);
    isInternshipCheck.push(...internship);
    onHandleToggle(values?.isCheckInStatus, values?.data);

    //remove duplicate isPresentCheck
    isPresentCheck = [...new Set(isPresentCheck)];
    isAbsentCheck = [...new Set(isAbsentCheck)];
    isLateCheck = [...new Set(isLateCheck)];
    isLeaveCheck = [...new Set(isLeaveCheck)];
    isInternshipCheck = [...new Set(isInternshipCheck)];

    const updated = {
      ...reportCheckInData,
      present: isPresentCheck,
      absent: isAbsentCheck,
      late: isLateCheck,
      leave: isLeaveCheck,
      internship: isInternshipCheck,
      updateBy: auth?.user?.id,
    };

    const created = {
      teacherId: auth?.user?.teacher?.id,
      classroomId,
      present: isPresentCheck,
      absent: isAbsentCheck,
      late: isLateCheck,
      leave: isLeaveCheck,
      internship: isInternshipCheck,
      checkInDate: new Date(),
      status: '1',
    };

    const options = {
      loading: 'กำลังบันทึก...',
      success: 'บันทึกสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    };

    if (reportCheckInData) {
      toast.promise(updateReportCheckIn(storedToken, updated), options);
    } else {
      toast.promise(addReportCheckIn(storedToken, created), options);
    }
    setTimeout(() => {
      fetchDailyReport(selectedDate, classroomId);
    }, 200);
    toggleCloseEditCheckIn();
    onClearAll();
  };

  const columns: GridColumns = [
    {
      flex: 0.15,
      minWidth: 160,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
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
      flex: 0.25,
      minWidth: 220,
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { account } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {account.title + '' + account.firstName + ' ' + account.lastName}
          </Typography>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'status',
      headerName: 'สถานะ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { checkInStatus } = row;
        return (
          <CustomChip
            icon={checkInStatueIcon[checkInStatus]}
            skin='light'
            size='small'
            label={checkInStatueName[checkInStatus]}
            color={checkInStatueColor[checkInStatus]}
            sx={{ textTransform: 'capitalize' }}
          />
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'teacher',
      headerName: 'เช็คชื่อโดย',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const {
          teacher: { account },
        } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {account.title + '' + account.firstName + ' ' + account.lastName}
          </Typography>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'action',
      headerName: 'แก้ไขเช็คชื่อ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { status } = row.student;
        return (
          <Button
            disabled={status === 'internship'}
            variant='contained'
            startIcon={<AccountEditOutline fontSize='small' />}
            onClick={() => handleOpenEditCheckIn({ ...row, classroomName: defaultClassroom, reportCheckInData })}
          >
            แก้ไข
          </Button>
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
    setDefaultClassroom(classroomName);
    await fetchDailyReport(null, classroomName.id);
  };

  const toggleCloseEditCheckIn = () => setOpenEditDrawer(!openEditDrawer);

  const handleCloseDeletedConfirm = () => setOpenDeletedConfirm(false);

  const handleClickOpenDeletedConfirm = () => setOpenDeletedConfirm(true);

  const handDeletedConfirm = async () => {
    toast.promise(removeReportCheckIn(storedToken, reportCheckInData?.id), {
      loading: 'กำลังลบการเช็คชื่อ...',
      success: 'ลบการเช็คชื่อสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    });

    setOpenDeletedConfirm(false);
    setTimeout(() => {
      fetchDailyReport(selectedDate, '');
    }, 200);
  };

  return (
    ability?.can('read', 'check-in-page') &&
    auth?.user?.role !== 'Admin' && (
      <Fragment>
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
                title={`รายงานการเช็คชื่อตอนเช้า`}
                subheader={`${new Date(selectedDate as Date).toLocaleDateString('th-TH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}`}
              />
              <CardContent>
                {!isEmpty(currentStudents) && (
                  <Typography variant='subtitle1'>{`ชั้น ${defaultClassroom?.name} จำนวน ${currentStudents.length} คน`}</Typography>
                )}
              </CardContent>
              <TableHeaderDaily
                value={classrooms}
                handleChange={handleSelectChange}
                defaultValue={defaultClassroom?.name}
                selectedDate={selectedDate}
                handleDateChange={handleDateChange}
                handleClickOpen={handleClickOpenDeletedConfirm}
                isDisabled={isEmpty(reportCheckInData)}
              />
              <DataGridCustom
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
                getRowClassName={(params) => {
                  const { status } = params.row.student;
                  return status === 'internship' ? 'internship' : 'normal';
                }}
              />
            </Card>
          </Grid>
        </Grid>

        {openEditDrawer && (
          <SidebarEditCheckInDrawer
            open={openEditDrawer}
            onSubmitted={onSubmittedCheckIn}
            toggle={toggleCloseEditCheckIn}
            data={selectedStudent}
            selectedDate={selectedDate as Date}
          />
        )}

        {openDeletedConfirm && (
          <Fragment>
            <Dialog
              open={openDeletedConfirm}
              disableEscapeKeyDown
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
              onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                  setOpenDeletedConfirm(false);
                }
              }}
            >
              <DialogTitle id='alert-dialog-title'>ยืนยันการลบเช็คชื่อหน้าเสาธง?</DialogTitle>
              <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                  {`คุณต้องการลบข้อมูลการเช็คชื่อของ
                  ${new Date(selectedDate as Date).toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  ใช่หรือไม่?`}
                </DialogContentText>
              </DialogContent>
              <DialogActions className='dialog-actions-dense'>
                <Button color='secondary' onClick={handleCloseDeletedConfirm}>
                  ยกเลิก
                </Button>
                <Button variant='outlined' color='error' onClick={handDeletedConfirm}>
                  ยืนยัน
                </Button>
              </DialogActions>
            </Dialog>
          </Fragment>
        )}
      </Fragment>
    )
  );
};

ReportCheckInDaily.acl = {
  action: 'read',
  subject: 'report-check-in-daily-page',
};

export default ReportCheckInDaily;
