// ** React Imports
import { Fragment, useContext, useState } from 'react';

// ** MUI Imports
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CheckboxProps,
  Container,
  Grid,
  IconButton,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridCellParams, GridColumns, GridEventListener } from '@mui/x-data-grid';

// ** Store Imports
import { useReportCheckInStore, useTeacherStore } from '@/store/index';

// ** Custom Components Imports
import TableHeader from '@/views/apps/reports/TableHeader';
import { useEffectOnce } from '@/hooks/userCommon';

// ** Config
import toast from 'react-hot-toast';
import { HiOutlineFlag } from 'react-icons/hi';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { isEmpty } from '@/@core/utils/utils';
import { CustomNoRowsOverlayCheckedIn } from '@/@core/components/check-in/checkedIn';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useRouter } from 'next/router';
import { Close } from 'mdi-material-ui';
import shallow from 'zustand/shallow';
import { useAuth } from '../../../hooks/useAuth';
import { LocalStorageService } from '@/services/localStorageService';
import Icon from '@/@core/components/icon';

interface CellType {
  row: any;
}
const localStorageService = new LocalStorageService();

const CheckboxStyled = styled(Checkbox)<CheckboxProps>(() => ({
  padding: '0 0 0 4px',
}));

const StudentCheckIn = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const alignCenter = useMediaQuery(theme.breakpoints.down('md')) ? 'center' : 'left';
  const storedToken = localStorageService.getToken()!;

  const { getReportCheckIn, addReportCheckIn }: any = useReportCheckInStore(
    (state) => ({
      getReportCheckIn: state.getReportCheckIn,
      addReportCheckIn: state.addReportCheckIn,
    }),
    shallow,
  );
  const { fetchClassroomByTeachId }: any = useTeacherStore(
    (state) => ({ fetchClassroomByTeachId: state.fetchClassroomByTeachId }),
    shallow,
  );
  const ability = useContext(AbilityContext);
  const router = useRouter();

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(isEmpty(currentStudents) ? 0 : currentStudents.length);
  // present
  const [isPresentCheck, setIsPresentCheck] = useState<any>([]);
  const [isPresentCheckAll, setIsPresentCheckAll] = useState(false);
  // absent
  const [isAbsentCheck, setIsAbsentCheck] = useState<any>([]);
  const [isAbsentCheckAll, setIsAbsentCheckAll] = useState(false);
  // late
  const [isLateCheck, setIsLateCheck] = useState<any>([]);
  const [isLateCheckAll, setIsLateCheckAll] = useState(false);
  // leave
  const [isLeaveCheck, setIsLeaveCheck] = useState<any>([]);
  const [isLeaveCheckAll, setIsLeaveCheckAll] = useState(false);
  // internship
  const [isInternshipCheck, setIsInternshipCheck] = useState<any>([]);
  const [isInternshipCheckAll, setIsInternshipCheckAll] = useState(false);

  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [reportCheckIn, setReportCheckIn] = useState<any>(false);
  const [loading, setLoading] = useState(true);
  const [openAlert, setOpenAlert] = useState<boolean>(true);

  // ดึงข้อมูลห้องเรียนของครู
  useEffectOnce(() => {
    const fetch = async () => {
      await fetchClassroomByTeachId(storedToken, auth?.user?.teacher?.id as string).then(async ({ data }: any) => {
        await getCheckInStatus(auth?.user?.teacher?.id as string, await data?.classrooms[0]?.id);
        const students = await data?.classrooms[0]?.students;
        setDefaultClassroom(await data?.classrooms[0]);
        setClassrooms(await data?.classrooms);
        setCurrentStudents(students);
      });
    };
    if (ability?.can('read', 'check-in-page') && (auth?.user?.role as string) !== 'Admin') {
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
      case 'internship':
        handleToggleInternship(param);
        break;
      default:
        break;
    }
    onRemoveToggleOthers(action, param);
  };

  const handleTogglePresent = (param: any): void => {
    setIsPresentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleAbsent = (param: any): void => {
    setIsAbsentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLate = (param: any): void => {
    setIsLateCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLeave = (param: any): void => {
    setIsLeaveCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleInternship = (param: any): void => {
    setIsInternshipCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
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
      setIsPresentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleAbsentChecked = (param: any): void => {
    if (isAbsentCheck.includes(param.id)) {
      setIsAbsentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLateChecked = (param: any): void => {
    if (isLateCheck.includes(param.id)) {
      setIsLateCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLeaveChecked = (param: any): void => {
    if (isLeaveCheck.includes(param.id)) {
      setIsLeaveCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleInternshipChecked = (param: any): void => {
    if (isInternshipCheck.includes(param.id)) {
      setIsInternshipCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
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

  const onHandleCheckAll = (action: string): void => {
    if (action === 'present') {
      handleTogglePresentAll();
    } else if (action === 'absent') {
      handleToggleAbsentAll();
    } else if (action === 'late') {
      handleToggleLateAll();
    } else if (action === 'leave') {
      handleToggleLeaveAll();
    } else if (action === 'internship') {
      handleToggleInternshipAll();
    }
    onClearAll(action);
  };

  const handleTogglePresentAll = (): void => {
    setIsPresentCheckAll(!isPresentCheckAll);
    setIsPresentCheck(currentStudents.map((student: any) => student.id));
    if (isPresentCheckAll) {
      setIsPresentCheck([]);
    }
  };

  const handleToggleAbsentAll = (): void => {
    setIsAbsentCheckAll(!isAbsentCheckAll);
    setIsAbsentCheck(currentStudents.map((student: any) => student.id));
    if (isAbsentCheckAll) {
      setIsAbsentCheck([]);
    }
  };

  const handleToggleLateAll = (): void => {
    setIsLateCheckAll(!isLateCheckAll);
    setIsLateCheck(currentStudents.map((student: any) => student.id));
    if (isLateCheckAll) {
      setIsLateCheck([]);
    }
  };

  const handleToggleLeaveAll = (): void => {
    setIsLeaveCheckAll(!isLeaveCheckAll);
    setIsLeaveCheck(currentStudents.map((student: any) => student.id));
    if (isLeaveCheckAll) {
      setIsLeaveCheck([]);
    }
  };

  const handleToggleInternshipAll = (): void => {
    setIsInternshipCheckAll(!isInternshipCheckAll);
    setIsInternshipCheck(currentStudents.map((student: any) => student.id));
    if (isInternshipCheckAll) {
      setIsInternshipCheck([]);
    }
  };

  const onClearAll = (action: string): void => {
    if (action !== 'present') {
      setIsPresentCheckAll(false);
      setIsPresentCheck([]);
    }
    if (action !== 'absent') {
      setIsAbsentCheckAll(false);
      setIsAbsentCheck([]);
    }
    if (action !== 'late') {
      setIsLateCheckAll(false);
      setIsLateCheck([]);
    }
    if (action !== 'leave') {
      setIsLeaveCheckAll(false);
      setIsLeaveCheck([]);
    }
    if (action !== 'internship') {
      setIsInternshipCheckAll(false);
      setIsInternshipCheck([]);
    }
  };

  const handleCellClick: GridEventListener<'cellClick'> = (params: any) => {
    onHandleToggle(params.field, params.row);
  };

  const handleColumnHeaderClick: GridEventListener<'columnHeaderClick'> = (params: any) => {
    onHandleCheckAll(params.field);
  };

  const columns: GridColumns = [
    {
      flex: 0.25,
      minWidth: 220,
      field: 'fullName',
      headerName: 'ชื่อ-สกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        return (
          <Typography noWrap variant='body1' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {row.title + '' + row.firstName + ' ' + row.lastName}
          </Typography>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'present',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'center' }}>
          {'มาเรียน'}
          <CheckboxStyled
            color='success'
            checked={isPresentCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isPresentCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox
          color='success'
          checked={isPresentCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'absent',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'ขาด'}
          <CheckboxStyled
            color='error'
            checked={isAbsentCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isAbsentCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox color='error' checked={isAbsentCheck.includes(params.id) || false} disableRipple disableFocusRipple />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'leave',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'ลา'}
          <CheckboxStyled
            color='secondary'
            checked={isLeaveCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isLeaveCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox
          color='secondary'
          checked={isLeaveCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'late',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'มาสาย'}
          <CheckboxStyled
            color='warning'
            checked={isLateCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isLateCheck.length > 0 && isLateCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox color='warning' checked={isLateCheck.includes(params.id) || false} disableRipple disableFocusRipple />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'internship',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: alignCenter,
      headerClassName: 'internship--header',
      cellClassName: 'internship--cell',
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'ฝึกงาน'}
          <CheckboxStyled
            color='primary'
            checked={isInternshipCheckAll ?? false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isInternshipCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox
          color='primary'
          checked={isInternshipCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
        />
      ),
    },
  ];

  // submit
  const onHandleSubmit = async (event: any) => {
    event.preventDefault();
    const data = {
      teacherId: auth?.user?.teacher?.id,
      classroomId: defaultClassroom.id,
      present: isPresentCheck,
      absent: isAbsentCheck,
      late: isLateCheck,
      leave: isLeaveCheck,
      internship: isInternshipCheck,
      checkInDate: new Date(),
      status: '1',
    };
    const totalStudents = isPresentCheck.concat(isAbsentCheck, isLateCheck, isLeaveCheck, isInternshipCheck).length;
    const isValidateCheckIn = totalStudents === currentStudents.length && isEmpty(reportCheckIn);
    if (isValidateCheckIn) {
      toast.promise(addReportCheckIn(storedToken, data), {
        loading: 'กำลังบันทึกเช็คชื่อ...',
        success: 'บันทึกเช็คชื่อสำเร็จ',
        error: 'เกิดข้อผิดพลาด',
      });
      setTimeout(() => {
        getCheckInStatus(auth?.user?.teacher?.id as string, defaultClassroom?.id);
        onClearAll('');
      }, 200);
    } else {
      toast.error('กรุณาเช็คชื่อของนักเรียนทุกคนให้ครบถ้วน!');
    }
  };

  const handleSelectChange = async (event: any) => {
    event.preventDefault();
    const {
      target: { value },
    } = event;
    const classroomObj: any = classrooms.filter((item: any) => item.name === value)[0];
    await getCheckInStatus(auth?.user?.teacher?.id as string, classroomObj?.id);
    setCurrentStudents(classroomObj.students);
    setDefaultClassroom(classroomObj);
    setOpenAlert(true);
    onClearAll('');
  };

  const getCheckInStatus = async (teacher: string, classroom: string) => {
    setLoading(true);
    await getReportCheckIn(storedToken, { teacher, classroom }).then(async (data: any) => {
      setReportCheckIn(await data);
      setLoading(false);
    });
  };

  return (
    ability?.can('read', 'check-in-page') &&
    (auth?.user?.role as string) !== 'Admin' && (
      <Fragment>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <HiOutlineFlag />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`เช็คชื่อตอนเช้า กิจกรรมหน้าเสาธง`}
                subheader={`${new Date(Date.now()).toLocaleDateString('th-TH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}`}
              />
              <CardContent>
                {!isEmpty(currentStudents) && (
                  <>
                    <Typography
                      variant='subtitle1'
                      sx={{ pb: 3 }}
                    >{`ชั้น ${defaultClassroom?.name} จำนวน ${currentStudents.length} คน`}</Typography>
                    {isEmpty(reportCheckIn) ? (
                      openAlert ? (
                        <Grid item xs={12} sx={{ mb: 3 }}>
                          <Alert
                            severity='error'
                            sx={{ '& a': { fontWeight: 400 } }}
                            action={
                              <IconButton
                                size='small'
                                color='inherit'
                                aria-label='close'
                                onClick={() => setOpenAlert(false)}
                              >
                                <Close fontSize='inherit' />
                              </IconButton>
                            }
                          >
                            <AlertTitle>ยังไม่มีการเช็คชื่อหน้าเสาธง</AlertTitle>
                          </Alert>
                        </Grid>
                      ) : null
                    ) : openAlert ? (
                      <Grid item xs={12} sx={{ mb: 3 }}>
                        <Alert
                          severity='success'
                          sx={{ '& a': { fontWeight: 400 } }}
                          action={
                            <IconButton
                              size='small'
                              color='inherit'
                              aria-label='close'
                              onClick={() => setOpenAlert(false)}
                            >
                              <Close fontSize='inherit' />
                            </IconButton>
                          }
                        >
                          <AlertTitle>เช็คชื่อหน้าเสาธงเรียบร้อยแล้ว</AlertTitle>
                        </Alert>
                      </Grid>
                    ) : null}
                  </>
                )}
              </CardContent>
              <TableHeader
                value={classrooms}
                handleChange={handleSelectChange}
                defaultValue={defaultClassroom?.name}
                handleSubmit={onHandleSubmit}
              />
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  '& .internship--cell': {
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
                  },
                  '& .internship--header': {
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
                  },
                }}
              >
                <DataGrid
                  autoHeight
                  columns={columns}
                  rows={isEmpty(reportCheckIn) ? currentStudents ?? [] : []}
                  disableColumnMenu
                  headerHeight={150}
                  loading={loading}
                  onCellClick={handleCellClick}
                  onColumnHeaderClick={handleColumnHeaderClick}
                  rowHeight={isEmpty(reportCheckIn) ? (isEmpty(currentStudents) ? 200 : 50) : 200}
                  rowsPerPageOptions={[pageSize]}
                  onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
                  getRowClassName={(params) => {
                    return params.row.status === 'internship' ? 'internship' : 'normal';
                  }}
                  components={{
                    NoRowsOverlay: isEmpty(reportCheckIn) ? CustomNoRowsOverlay : CustomNoRowsOverlayCheckedIn,
                  }}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Fragment>
    )
  );
};

StudentCheckIn.acl = {
  action: 'read',
  subject: 'check-in-page',
};

export default StudentCheckIn;
