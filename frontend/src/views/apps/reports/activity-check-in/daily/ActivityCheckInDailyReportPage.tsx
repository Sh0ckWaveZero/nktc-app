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
import { useReportCheckInStore } from '@/store/apps/report-check-in';
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
import React from 'react';
import { toApiDate } from '@/utils/datetime';
import { sortStudentRecordsByStudentId } from '@/utils/student-sort';

interface CellType {
  row: any;
}

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
  present: 'มาเรียน',
  absent: 'ขาดเรียน',
  late: 'มาสาย',
  leave: 'ลา',
  notCheckIn: 'ยังไม่เช็คชื่อ',
  none: 'ยังไม่เช็คชื่อ',
  internship: 'นักศึกษาฝึกงาน',
};

const REPORT_CHECK_IN_STATUSES = ['present', 'absent', 'late', 'leave', 'internship'] as const;

const buildUpdatedReportStatusBuckets = (reportCheckInData: any, selectedStatus: string, studentRecordId: string) => {
  const buckets = REPORT_CHECK_IN_STATUSES.reduce(
    (result, status) => ({
      ...result,
      [status]: Array.isArray(reportCheckInData?.[status]) ? [...reportCheckInData[status]] : [],
    }),
    {} as Record<(typeof REPORT_CHECK_IN_STATUSES)[number], string[]>,
  );

  if (!REPORT_CHECK_IN_STATUSES.includes(selectedStatus as (typeof REPORT_CHECK_IN_STATUSES)[number])) {
    return buckets;
  }

  REPORT_CHECK_IN_STATUSES.forEach((status) => {
    buckets[status] = buckets[status].filter((id) => id !== studentRecordId);
  });

  const status = selectedStatus as (typeof REPORT_CHECK_IN_STATUSES)[number];
  buckets[status] = [...buckets[status], studentRecordId];

  return buckets;
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

const ActivityCheckInDailyReportPage = () => {
  const auth = useAuth();
  const ability = useContext(AbilityContext);
  const router = useRouter();

  // ** React Query - Fetch teacher's students and classrooms
  const teacherId = auth?.user?.teacher?.id as string;
  const { data: teacherData, isLoading: isLoadingTeacherData } = useTeacherStudents(teacherId);

  const { findDailyReport, updateReportCheckIn, removeReportCheckIn, addReportCheckIn }: any = useReportCheckInStore(
    (state) => ({
      findDailyReport: state.findDailyReport,
      updateReportCheckIn: state.updateReportCheckIn,
      removeReportCheckIn: state.removeReportCheckIn,
      addReportCheckIn: state.addReportCheckIn,
    }),
    shallow,
  );

  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [selectedDate, setDateSelected] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [reportCheckInData, setReportCheckInData] = useState<any>(null);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState<boolean>(false);

  // Combine loading states from React Query and local state
  const isLoading = isLoadingTeacherData || loading;

  // Fetch daily report
  const fetchDailyReport = async (date: Date | null = null, classroom: any = '') => {
    setLoading(true);
    const classroomInfo = classroom || defaultClassroom?.id;
    const dateInfo = date || selectedDate;

    if (!classroomInfo || !dateInfo) {
      setLoading(false);
      return;
    }

    try {
      const data = await findDailyReport({
        teacherId: auth?.user?.teacher?.id,
        classroomId: classroomInfo,
        startDate: toApiDate(dateInfo as Date),
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
    if (!ability?.can('read', 'report-check-in-daily-page') || (auth?.user?.role as string) === 'Admin') {
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
    fetchDailyReport(null, classroom.id);
  }, [teacherData, isLoadingTeacherData]);

  const handleOpenEditCheckIn = (param: any): void => {
    setSelectedStudent(param);
    setOpenEditDrawer(true);
  };

  const onSubmittedCheckIn = async (event: any, values: any): Promise<void> => {
    event.preventDefault();
    const classroomId = values?.data?.classroomName?.id;
    const { reportCheckInData } = values?.data || {};
    const studentRecordId = values?.data?.student?.id || values?.data?.id;
    const statusBuckets = buildUpdatedReportStatusBuckets(reportCheckInData, values?.isCheckInStatus, studentRecordId);

    const updated = {
      ...reportCheckInData,
      ...statusBuckets,
      updateBy: auth?.user?.id,
    };

    const created = {
      teacherId: auth?.user?.teacher?.id,
      classroomId,
      ...statusBuckets,
      checkInDate: toApiDate(selectedDate ?? new Date()),
      status: '1',
    };

    const options = {
      pending: 'กำลังบันทึก...',
      success: 'บันทึกสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    };

    try {
      if (reportCheckInData) {
        await toast.promise(updateReportCheckIn(updated), options);
      } else {
        await toast.promise(addReportCheckIn(created), options);
      }
      await fetchDailyReport(selectedDate, classroomId);
      toggleCloseEditCheckIn();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDateChange = async (date: Date | null) => {
    const nextDate = date ?? new Date();
    setDateSelected(nextDate);
    await fetchDailyReport(nextDate, defaultClassroom?.id);
  };

  const handleSelectChange = async (event: any) => {
    event.preventDefault();
    const {
      target: { value },
    } = event;
    const classroomName: any = classrooms.filter((item: any) => item.name === value)[0];
    setLoading(true);
    setDefaultClassroom(classroomName);
    await fetchDailyReport(selectedDate, classroomName.id);
  };

  const toggleCloseEditCheckIn = () => setOpenEditDrawer(!openEditDrawer);

  const handleCloseDeletedConfirm = () => setOpenDeletedConfirm(false);

  const handleClickOpenDeletedConfirm = () => setOpenDeletedConfirm(true);

  const handDeletedConfirm = async () => {
    toast.promise(removeReportCheckIn(reportCheckInData?.id), {
      pending: 'กำลังลบการเช็คชื่อ...',
      success: 'ลบการเช็คชื่อสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    });

    setOpenDeletedConfirm(false);
    setTimeout(() => {
      fetchDailyReport(selectedDate, defaultClassroom?.id);
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
    ability?.can('read', 'report-check-in-daily-page') &&
    auth?.user?.role !== 'Admin' && (
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
                title='รายงานการเช็คชื่อหน้าเสาธง'
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
              <DialogTitle id='alert-dialog-title'>ยืนยันการลบข้อมูลการเช็คชื่อหน้าเสาธง?</DialogTitle>
              <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                  {`คุณต้องการลบข้อมูลการเช็คชื่อหน้าเสาธง ของวันที่
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

export default ActivityCheckInDailyReportPage;
