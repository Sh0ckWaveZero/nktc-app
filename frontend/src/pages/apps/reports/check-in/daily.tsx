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
} from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
// ** Custom Components Imports
import CustomChip from '@/@core/components/mui/chip';

// ** Icons Imports

// ** Store Imports
import { useUserStore, useReportCheckInStore, useClassroomStore } from '@/store/index';

// ** Custom Components Imports
import { useEffectOnce } from '@/hooks/userCommon';

// ** Config
import toast, { Toaster } from 'react-hot-toast';
import ReactHotToast from '@/@core/styles/libs/react-hot-toast';
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
  AlertOctagramOutline,
} from 'mdi-material-ui';
import SidebarEditCheckInDrawer from '@/views/apps/reports/check-in/EditCheckInDrawer';

interface CellType {
  // row: teachersTypes;
  row: any;
}

// ** Vars
const checkInStatueIcon: any = {
  present: <AccountCheckOutline />,
  absent: <AccountCancelOutline />,
  late: <AccountClockOutline />,
  leave: <AccountFilterOutline />,
  notCheckIn: <AlertOctagramOutline />,
};

const checkInStatueColor: any = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  leave: 'info',
  notCheckIn: 'error',
};

const checkInStatueName: any = {
  present: 'มาเรียน',
  absent: 'ขาดเรียน',
  late: 'มาสาย',
  leave: 'ลา',
  notCheckIn: 'ยังไม่เช็คชื่อ',
};

const ReportCheckInDaily = () => {
  // ** Local variable
  let isPresentCheck: any[] = [];
  let isAbsentCheck: any[] = [];
  let isLateCheck: any[] = [];
  let isLeaveCheck: any[] = [];

  // ** Hooks
  const { fetchTeachClassroom } = useClassroomStore();
  const { userInfo, accessToken } = useUserStore();
  const { getReportCheckIn, findDailyReport, updateReportCheckIn, removeReportCheckIn } = useReportCheckInStore();
  const ability = useContext(AbilityContext);
  const router = useRouter();

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(isEmpty(currentStudents) ? 0 : currentStudents.length);
  const [classroomName, setClassroomName] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [selectedDate, setDateSelected] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [reportCheckInData, setReportCheckInData] = useState<any>(null);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState<boolean>(false);

  // ดึงข้อมูลห้องเรียนของครู
  useEffectOnce(() => {
    const fetch = async () => {
      fetchTeachClassroom(accessToken, userInfo?.teacher?.id).then(async (result: any) => {
        setClassroomName((await result) ? result[0] : []);
        setClassrooms((await result) ? result : []);
        await fetchDailyReport(null, (await result) ? result[0].id : {});
      });
    };
    // check permission
    if (ability?.can('read', 'report-check-in-daily-page') && userInfo.role !== 'Admin') {
      fetch();
    } else {
      router.push('/401');
    }
  });

  const fetchDailyReport = async (date: Date | null = null, classroom: any = '') => {
    setLoading(true);
    await findDailyReport(accessToken, {
      teacherId: userInfo?.teacher?.id,
      classroomId: classroom ? classroom : classroomName.id,
      startDate: date ? date : selectedDate,
    }).then(async (data: any) => {
      setCurrentStudents(await data[0]?.students);
      setReportCheckInData((await data) ? data[0]?.reportCheckIn : null);
      getReportCheckIn(accessToken, {
        teacher: userInfo?.teacher?.id,
        classroom: classroom ? classroom : classroomName.id,
      });
      setLoading(false);
    });
  };

  const onHandleToggle = (action: string, param: any): void => {
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

  const onSetToggle = (prevState: any, param: any): any => {
    const prevSelection = prevState;
    const index = prevSelection.indexOf(param.id);

    let newSelection: any[] = [];

    if (index === -1) {
      newSelection = newSelection.concat(prevSelection, param.id);
    } else if (index === 0) {
      newSelection = newSelection.concat(prevSelection.slice(1));
    } else if (index === prevSelection.length - 1) {
      newSelection = newSelection.concat(prevSelection.slice(0, -1));
    } else if (index > 0) {
      newSelection = newSelection.concat(prevSelection.slice(0, index), prevSelection.slice(index + 1));
    }

    return newSelection;
  };

  const onRemoveToggleOthers = (action: string, param: any): void => {
    switch (action) {
      case 'present':
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'absent':
        onHandlePresentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'late':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'leave':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
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

  const onRemoveToggle = (prevState: any, param: any): any => {
    const prevSelection = prevState;
    const index = prevSelection.indexOf(param.id);

    let newSelection: any[] = [];

    if (index !== -1) {
      newSelection = newSelection.concat(prevSelection.slice(0, index), prevSelection.slice(index + 1));
    }

    return newSelection;
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
    isPresentCheck.push(...(values?.data?.reportCheckInData?.present ?? []));
    isAbsentCheck.push(...(values?.data?.reportCheckInData?.absent ?? []));
    isLateCheck.push(...(values?.data?.reportCheckInData?.late ?? []));
    isLeaveCheck.push(...(values?.data?.reportCheckInData?.leave ?? []));
    onHandleToggle(values?.isCheckInStatus, values?.data);
    const data = {
      ...values?.data?.reportCheckInData,
      present: isPresentCheck,
      absent: isAbsentCheck,
      late: isLateCheck,
      leave: isLeaveCheck,
      updateBy: userInfo?.id,
    };

    toast.promise(updateReportCheckIn(accessToken, data), {
      loading: 'กำลังบันทึกการแก้ไขเช็คชื่อ...',
      success: 'บันทึกการแก้ไขเช็คชื่อสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    });

    await fetchDailyReport(selectedDate, '');
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
        const { checkInStatus } = row;
        return (
          <Button
            disabled={checkInStatus === 'notCheckIn'}
            variant='contained'
            startIcon={<AccountEditOutline fontSize='small' />}
            onClick={() => handleOpenEditCheckIn({ ...row, classroomName, reportCheckInData })}
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
    setClassroomName(classroomName);
    await fetchDailyReport(null, classroomName.id);
  };

  const toggleCloseEditCheckIn = () => setOpenEditDrawer(!openEditDrawer);

  const handleCloseDeletedConfirm = () => setOpenDeletedConfirm(false);

  const handleClickOpenDeletedConfirm = () => setOpenDeletedConfirm(true);

  const handDeletedConfirm = async () => {
    toast.promise(removeReportCheckIn(accessToken, reportCheckInData?.id), {
      loading: 'กำลังลบการเช็คชื่อ...',
      success: 'ลบการเช็คชื่อสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    });

    setOpenDeletedConfirm(false);
    await fetchDailyReport(selectedDate, '');
  };

  return (
    ability?.can('read', 'check-in-page') &&
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
                  <Typography variant='subtitle1'>{`ชั้น ${classroomName?.name} จำนวน ${currentStudents.length} คน`}</Typography>
                )}
              </CardContent>
              <TableHeaderDaily
                value={classrooms}
                handleChange={handleSelectChange}
                defaultValue={classroomName?.name}
                selectedDate={selectedDate}
                handleDateChange={handleDateChange}
                handleClickOpen={handleClickOpenDeletedConfirm}
                isDisabled={isEmpty(reportCheckInData)}
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
                  NoRowsOverlay: CustomNoRowsOverlay ,
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
      </>
    )
  );
};

ReportCheckInDaily.acl = {
  action: 'read',
  subject: 'report-check-in-daily-page',
};

export default ReportCheckInDaily;
