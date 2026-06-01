'use client';

import { useContext, useState, useEffect } from 'react';
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
import { DataGrid, gridClasses, GridColDef } from '@mui/x-data-grid';
import CustomChip from '@/@core/components/mui/chip';
import { useActivityCheckInStore } from '@/store/apps/activity-check-in';
import { useTeacherStudents } from '@/hooks/queries/useTeachers';
import { useEffectOnce } from '@/hooks/userCommon';
import { toast } from 'react-toastify';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { isEmpty } from '@/@core/utils/utils';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useRouter } from 'next/navigation';
import { BsCalendar2Date } from 'react-icons/bs';
import TableHeaderDaily from '@/views/apps/reports/check-in/TableHeaderDaily';
import {
  AccountCancelOutline,
  AccountCheckOutline,
  AccountEditOutline,
  AccountLockOutline,
  AlertOctagramOutline,
} from 'mdi-material-ui';
import SidebarEditCheckInDrawer from '@/views/apps/reports/check-in/EditCheckInDrawer';
import { shallow } from 'zustand/shallow';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import React from 'react';
import { toApiDate } from '@/utils/datetime';
import { sortStudentRecordsByStudentId } from '@/utils/student-sort';

interface CellType {
  row: any;
}

const ACTIVITY_TYPES = [
  { value: 'CLUB', label: 'กิจกรรมชมรมวิชาชีพ' },
  { value: 'AST', label: 'กิจกรรม อวท.' },
  { value: 'SCOUT', label: 'กิจกรรมลูกเสือ' },
];

const checkInStatueIcon: any = {
  present: <AccountCheckOutline />,
  absent: <AccountCancelOutline />,
  late: <AlertOctagramOutline />,
  leave: <AccountCancelOutline />,
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
  present: 'เข้าร่วม',
  absent: 'ไม่เข้าร่วม',
  late: 'มาสาย',
  leave: 'ลา',
  notCheckIn: 'ยังไม่เช็คชื่อ',
  none: 'ยังไม่เช็คชื่อ',
  internship: 'นักศึกษาฝึกงาน',
};

const NORMAL_OPACITY = 0.2;
const DataGridCustom = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.internship`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[700],
    }),
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
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, NORMAL_OPACITY + theme.palette.action.selectedOpacity),
        },
      },
    },
  },
}));

const CheckInDailyReportPage = () => {
  const auth = useAuth();
  const { isAdmin } = useRole();
  const ability = useContext(AbilityContext);
  const router = useRouter();

  // ** React Query - Fetch teacher's students and classrooms
  const teacherId = auth?.user?.teacher?.id as string;
  const { data: teacherData, isLoading: isLoadingTeacherData } = useTeacherStudents(teacherId);

  const { findDailyReport, updateActivityCheckIn, removeActivityCheckIn, addActivityCheckIn }: any =
    useActivityCheckInStore(
      (state) => ({
        findDailyReport: state.findDailyReport,
        updateActivityCheckIn: state.updateActivityCheckIn,
        removeActivityCheckIn: state.removeActivityCheckIn,
        addActivityCheckIn: state.addActivityCheckIn,
      }),
      shallow,
    );

  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [selectedDate, setDateSelected] = useState<Date | null>(new Date());
  const [activityType, setActivityType] = useState<string>('CLUB');
  const [loading, setLoading] = useState<boolean>(true);
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [reportCheckInData, setReportCheckInData] = useState<any>(null);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState<boolean>(false);

  // Combine loading states from React Query and local state
  const isLoading = isLoadingTeacherData || loading;

  // Fetch daily report
  const fetchDailyReport = async (date: Date | null = null, classroom: any = '', selectedActivity: string = '') => {
    setLoading(true);
    const classroomInfo = classroom || defaultClassroom?.id;
    const dateInfo = date || selectedDate;
    const activityInfo = selectedActivity || activityType;

    if (!classroomInfo) {
      setLoading(false);
      return;
    }

    try {
      const data = await findDailyReport({
        teacherId: auth?.user?.teacher?.id,
        classroomId: classroomInfo,
        startDate: toApiDate(dateInfo as Date),
        activityType: activityInfo,
      });

      const dataArray = Array.isArray(data) ? data : [];
      const reportCheckInData = dataArray.find((item: any) => item.id === classroomInfo);
      const students = sortStudentRecordsByStudentId(reportCheckInData?.students ?? []);
      setCurrentStudents(students);
      setPaginationModel({ page: 0, pageSize: students.length > 0 ? students.length : 10 });
      setReportCheckInData(reportCheckInData?.reportCheckIn ?? null);
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  // Authorization check
  useEffectOnce(() => {
    if (!ability?.can('read', 'daily-check-in-report-activity-page') || isAdmin) {
      router.push('/401');
      return;
    }

    if (isEmpty(auth?.user?.teacherOnClassroom)) {
      toast.error('ไม่พบข้อมูลที่ปรีกษาประจำชั้น');
      router.push('/pages/account-settings');
    }
  });

  // Process teacher data when available
  useEffect(() => {
    const errorMessage = 'ไม่พบข้อมูลห้องเรียนที่รับผิดชอบ';
    const redirectTo = '/pages/account-settings';

    if (!teacherData?.classrooms || !teacherData.classrooms.length) {
      if (!isLoadingTeacherData && teacherData !== undefined) {
        toast.error(errorMessage);
        router.push(redirectTo);
      }
      return;
    }

    const [classroom] = teacherData.classrooms;

    if (!classroom) {
      return;
    }

    const classrooms = teacherData.classrooms || [];
    setDefaultClassroom(classroom);
    setClassrooms(classrooms);

    // Fetch daily report for this classroom
    fetchDailyReport(null, classroom.id, activityType);
  }, [teacherData, isLoadingTeacherData]);

  const handleOpenEditCheckIn = (param: any): void => {
    setSelectedStudent(param);
    setOpenEditDrawer(true);
  };

  const onSubmittedCheckIn = async (event: any, values: any): Promise<void> => {
    event.preventDefault();
    const classroomId = values?.data?.classroomName?.id;
    const { reportCheckInData } = values?.data || {};
    let present = Array.isArray(reportCheckInData?.present) ? [...reportCheckInData.present] : [];
    let absent = Array.isArray(reportCheckInData?.absent) ? [...reportCheckInData.absent] : [];

    const studentRecordId = values?.data?.student?.id || values?.data?.id;

    if (values?.isCheckInStatus === 'present') {
      if (!present.includes(studentRecordId)) {
        present.push(studentRecordId);
      }
      absent = absent.filter((id) => id !== studentRecordId);
    } else if (values?.isCheckInStatus === 'absent') {
      if (!absent.includes(studentRecordId)) {
        absent.push(studentRecordId);
      }
      present = present.filter((id) => id !== studentRecordId);
    }

    const updated = {
      ...reportCheckInData,
      present,
      absent,
      activityType: activityType,
      updateBy: auth?.user?.id,
    };

    const created = {
      teacherId: auth?.user?.teacher?.id,
      classroomId,
      present,
      absent,
      activityType: activityType,
      checkInDate: toApiDate(selectedDate as Date | string),
      status: '1',
    };

    const options = {
      pending: 'กำลังบันทึก...',
      success: 'บันทึกสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    };

    try {
      if (reportCheckInData) {
        await toast.promise(updateActivityCheckIn(updated), options);
      } else {
        await toast.promise(addActivityCheckIn(created), options);
      }
      await fetchDailyReport(selectedDate, classroomId, activityType);
      toggleCloseEditCheckIn();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDateChange = async (date: Date | null) => {
    setDateSelected(date);
    await fetchDailyReport(date, defaultClassroom?.id, activityType);
  };

  const handleSelectChange = async (event: any) => {
    event.preventDefault();
    const {
      target: { value },
    } = event;
    const classroomName: any = classrooms.filter((item: any) => item.name === value)[0];
    setLoading(true);
    setDefaultClassroom(classroomName);
    await fetchDailyReport(selectedDate, classroomName.id, activityType);
  };

  const handleActivityTypeChange = async (event: any) => {
    const newActivityType = event.target.value;
    setActivityType(newActivityType);
    await fetchDailyReport(selectedDate, defaultClassroom?.id, newActivityType);
  };

  const toggleCloseEditCheckIn = () => setOpenEditDrawer(!openEditDrawer);

  const handleCloseDeletedConfirm = () => setOpenDeletedConfirm(false);

  const handleClickOpenDeletedConfirm = () => setOpenDeletedConfirm(true);

  const handDeletedConfirm = async () => {
    toast.promise(removeActivityCheckIn(reportCheckInData?.id), {
      pending: 'กำลังลบการเช็คชื่อ...',
      success: 'ลบการเช็คชื่อสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    });

    setOpenDeletedConfirm(false);
    setTimeout(() => {
      fetchDailyReport(selectedDate, defaultClassroom?.id, activityType);
    }, 200);
  };

  const columns: GridColDef[] = [
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
            {(account.title ?? '') + account.firstName + ' ' + account.lastName}
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

  return (
    ability?.can('read', 'daily-check-in-report-activity-page') &&
    !isAdmin && (
      <React.Fragment>
        <Grid container spacing={6}>
          <Grid size={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <BsCalendar2Date />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`รายงานการเช็คชื่อกิจกรรม - ${ACTIVITY_TYPES.find((t) => t.value === activityType)?.label || ''}`}
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
                {reportCheckInData?.note?.trim() && (
                  <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                    {`หมายเหตุ: ${reportCheckInData.note.trim()}`}
                  </Typography>
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
                activityType={activityType}
                onActivityTypeChange={handleActivityTypeChange}
                activityTypes={ACTIVITY_TYPES}
              />
              <DataGridCustom
                columns={columns}
                rows={currentStudents ?? []}
                disableColumnMenu
                loading={isLoading}
                getRowHeight={() => 'auto'}
                getEstimatedRowHeight={() => 52}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 20, 50, { value: -1, label: 'ทั้งหมด' }]}
                slots={{
                  noRowsOverlay: CustomNoRowsOverlay,
                }}
                getRowClassName={(params) => {
                  const { status } = params.row.student;
                  return status === 'internship' ? 'internship' : 'normal';
                }}
                sx={{
                  '& .MuiDataGrid-cell': { py: 1, alignItems: 'center', display: 'flex', overflow: 'visible' },
                  '& .MuiDataGrid-row': { overflow: 'visible' },
                  overflow: 'visible',
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
          <React.Fragment>
            <Dialog
              open={openDeletedConfirm}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
              onClose={(event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                  setOpenDeletedConfirm(false);
                }
              }}
            >
              <DialogTitle id='alert-dialog-title'>ยืนยันการลบการเช็คชื่อกิจกรรม?</DialogTitle>
              <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                  {`คุณต้องการลบข้อมูลการเช็คชื่อกิจกรรม ${ACTIVITY_TYPES.find((t) => t.value === activityType)?.label || ''} ของวันที่
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
          </React.Fragment>
        )}
      </React.Fragment>
    )
  );
};

export default CheckInDailyReportPage;
