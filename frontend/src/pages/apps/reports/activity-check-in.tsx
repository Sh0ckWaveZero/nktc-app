// ** React Imports
import { Fragment, useContext, useState, useRef } from 'react';

// ** MUI Imports
import {
  Typography,
  CardHeader,
  Card,
  Grid,
  Avatar,
  CardContent,
  Checkbox,
  Container,
  Alert,
  IconButton,
  AlertTitle,
  styled,
  alpha,
  CheckboxProps,
  useMediaQuery,
  useTheme,
  Paper,
  Popper,
} from '@mui/material';
import { DataGrid, GridCellParams, gridClasses, GridColumns, GridEventListener } from '@mui/x-data-grid';

// ** Store Imports
import { useActivityCheckInStore, useTeacherStore } from '@/store/index';

// ** Custom Components Imports
import TableHeader from '@/views/apps/reports/TableHeader';
import { useEffectOnce } from '@/hooks/userCommon';

// ** Config
import toast from 'react-hot-toast';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { isEmpty } from '@/@core/utils/utils';
import { CustomNoRowsOverlayActivityCheckedIn } from '@/@core/components/check-in/checkedIn';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useRouter } from 'next/router';
import { Close } from 'mdi-material-ui';
import shallow from 'zustand/shallow';
import { useAuth } from '../../../hooks/useAuth';
import { LocalStorageService } from '@/services/localStorageService';
import { FaFlagCheckered } from 'react-icons/fa';
import Icon from '@/@core/components/icon';

interface CellType {
  row: any;
}
const localStorageService = new LocalStorageService();
const NORMAL_OPACITY = 0.2;
const DataGridCustom = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.intern`]: {
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

const CheckboxStyled = styled(Checkbox)<CheckboxProps>(({}) => ({
  padding: '0 0 0 4px',
}));

const StudentCheckIn = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const alignCenter = useMediaQuery(theme.breakpoints.down('md')) ? 'center' : 'left';
  const storedToken = localStorageService.getToken()!;

  const { getActivityCheckIn, addActivityCheckIn }: any = useActivityCheckInStore(
    (state) => ({
      getActivityCheckIn: state.getActivityCheckIn,
      addActivityCheckIn: state.addActivityCheckIn,
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
  const [normalStudents, setNormalStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(isEmpty(currentStudents) ? 0 : currentStudents.length);
  const [isPresentCheckAll, setIsPresentCheckAll] = useState(false);
  const [isAbsentCheckAll, setIsAbsentCheckAll] = useState(false);
  const [isPresentCheck, setIsPresentCheck] = useState<any>([]);
  const [isAbsentCheck, setIsAbsentCheck] = useState<any>([]);
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [reportCheckIn, setReportCheckIn] = useState<any>(false);
  const [loading, setLoading] = useState(true);
  const [openAlert, setOpenAlert] = useState<boolean>(true);

  // ** Popper
  const popperRef: any = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const openPopper = Boolean(anchorEl);

  // ดึงข้อมูลห้องเรียนของครู
  useEffectOnce(() => {
    const fetch = async () => {
      await fetchClassroomByTeachId(storedToken, auth?.user?.teacher?.id as string).then(async ({ data }: any) => {
        await getCheckInStatus(auth?.user?.teacher?.id as string, await data?.classrooms[0]?.id);
        const students = await data?.classrooms[0]?.students;
        setDefaultClassroom(await data?.classrooms[0]);
        setClassrooms(await data?.classrooms);
        setCurrentStudents(students);
        setNormalStudents(students.filter((student: any) => student?.status !== 'intern'));
      });
    };
    if (ability?.can('read', 'check-in-page') && (auth?.user?.role as string) !== 'Admin') {
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
        break;
      case 'absent':
        onHandlePresentChecked(param);
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
    }

    onClearAll(action);
  };

  const handleTogglePresentAll = (): void => {
    setIsPresentCheckAll(!isPresentCheckAll);
    setIsPresentCheck(normalStudents.map((student: any) => student.id));
    if (isPresentCheckAll) {
      setIsPresentCheck([]);
    }
  };

  const handleToggleAbsentAll = (): void => {
    setIsAbsentCheckAll(!isAbsentCheckAll);
    setIsAbsentCheck(normalStudents.map((student: any) => student.id));
    if (isAbsentCheckAll) {
      setIsAbsentCheck([]);
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
  };

  const handleCellClick: GridEventListener<'cellClick'> = (params: any) => {
    params.row.status !== 'intern' ? onHandleToggle(params.field, params.row) : null;
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
          {'เข้าร่วม'}
          <CheckboxStyled
            color='success'
            checked={isPresentCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isPresentCheck.length === normalStudents.length
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
          disabled={params.row.status === 'intern'}
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
          {'ไม่เข้าร่วม'}
          <CheckboxStyled
            color='error'
            checked={isAbsentCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isAbsentCheck.length === normalStudents.length
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
          color='error'
          checked={isAbsentCheck.includes(params.id) || false}
          disabled={params.row.status === 'intern'}
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

      checkInDate: new Date(),
      status: '1',
    };
    const totalStudents = isPresentCheck.concat(isAbsentCheck).length;
    if (totalStudents === currentStudents.length && isEmpty(reportCheckIn)) {
      toast.promise(addActivityCheckIn(storedToken, data), {
        loading: 'กำลังบันทึกเช็คชื่อ...',
        success: 'บันทึกเช็คชื่อสำเร็จ',
        error: 'เกิดข้อผิดพลาด',
      });
      getCheckInStatus(auth?.user?.teacher?.id as string, defaultClassroom?.id);
      onClearAll('');
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
    await getActivityCheckIn(storedToken, { teacher, classroom }).then(async (data: any) => {
      setReportCheckIn(await data);
      setLoading(false);
    });
  };

  const handlePopperOpen = (event: any) => {
    const id = event.currentTarget.dataset.id;
    const row = normalStudents.find((item: any) => item.id === id);
    if (!isEmpty(row)) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handlePopperClose = (event: any) => {
    if (anchorEl == null || popperRef.current.contains(event.nativeEvent.relatedTarget)) {
      return;
    }
    setAnchorEl(null);
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
                    <FaFlagCheckered />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`เช็คชื่อกิจกรรม`}
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
                            <AlertTitle>ยังไม่มีการเช็คชื่อร่วมกิจกรรม</AlertTitle>
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
                          <AlertTitle>เช็คชื่อร่วมกิจกรรมเรียบร้อยแล้ว</AlertTitle>
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
              <DataGridCustom
                autoHeight
                columns={columns}
                rows={isEmpty(reportCheckIn) ? currentStudents ?? [] : []}
                disableColumnMenu
                headerHeight={150}
                loading={loading}
                rowHeight={isEmpty(reportCheckIn) ? (isEmpty(currentStudents) ? 200 : 50) : 200}
                rowsPerPageOptions={[pageSize]}
                onCellClick={handleCellClick}
                onColumnHeaderClick={handleColumnHeaderClick}
                onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
                getRowClassName={(params) => {
                  return params.row.status === 'intern' ? 'intern' : 'normal';
                }}
                components={{
                  NoRowsOverlay: isEmpty(reportCheckIn) ? CustomNoRowsOverlay : CustomNoRowsOverlayActivityCheckedIn,
                }}
                componentsProps={{
                  row: {
                    onMouseEnter: handlePopperOpen,
                    onMouseLeave: handlePopperClose,
                  },
                }}
              />
              <Popper
                ref={popperRef}
                open={openPopper}
                anchorEl={anchorEl}
                placement={'auto'}
                onMouseLeave={() => setAnchorEl(null)}
                nonce={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {() => (
                  <Paper
                    sx={{
                      transform: 'translateX(-140px)',
                      zIndex: 100,
                    }}
                  >
                    <Typography color={'primary.main'} variant='subtitle1' sx={{ p: 2 }}>
                      ฝึกงาน
                    </Typography>
                  </Paper>
                )}
              </Popper>
            </Card>
          </Grid>
        </Grid>
      </Fragment>
    )
  );
};

StudentCheckIn.acl = {
  action: 'read',
  subject: 'activity-check-in-page',
};

export default StudentCheckIn;
