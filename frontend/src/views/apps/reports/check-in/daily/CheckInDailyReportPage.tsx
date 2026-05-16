'use client';

import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CheckboxProps,
  Grid,
  IconButton,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridEventListener, gridClasses } from '@mui/x-data-grid';
import React, { Fragment, use, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useActivityCheckInStore } from '@/store/index';
import { useTeacherClassroomsAndStudents } from '@/hooks/queries/useCheckIn';

import { AbilityContext } from '@/layouts/components/acl/Can';
import { Close } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { CustomNoRowsOverlayActivityCheckedIn } from '@/@core/components/check-in/checkedIn';
import { HiFlag } from 'react-icons/hi';
import IconifyIcon from '@/@core/components/icon';
import RenderAvatar from '@/@core/components/avatar';
import TableHeader from '@/views/apps/reports/TableHeader';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useEffectOnce } from '@/hooks/userCommon';
import { useRouter } from 'next/navigation';
import { toApiDate } from '@/utils/datetime';

interface CellType {
  row: any;
}

const NORMAL_OPACITY = 0.2;

const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

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

const CheckboxStyled = styled(Checkbox)<CheckboxProps>(() => ({
  padding: '0 0 0 4px',
}));

// ── State ─────────────────────────────────────────────────────────────────────

interface CheckInState {
  currentStudents: any[];
  normalStudents: any[];
  pageSize: number;
  currentPage: number;
  isPresentCheckAll: boolean;
  isAbsentCheckAll: boolean;
  isPresentCheck: any[];
  isAbsentCheck: any[];
  defaultClassroom: any;
  classrooms: any;
  reportCheckIn: any;
  loading: boolean;
  openAlert: boolean;
}

type CheckInAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLASSROOM_LOADED'; payload: { classroom: any; classrooms: any; flatStudents: any[]; pageSize: number } }
  | { type: 'SELECT_CLASSROOM'; payload: { classroom: any; students: any[] } }
  | { type: 'SET_REPORT_CHECK_IN'; payload: any }
  | { type: 'TOGGLE_PRESENT'; payload: any[] }
  | { type: 'TOGGLE_ABSENT'; payload: any[] }
  | { type: 'TOGGLE_PRESENT_ALL'; payload: { all: boolean; check: any[] } }
  | { type: 'TOGGLE_ABSENT_ALL'; payload: { all: boolean; check: any[] } }
  | { type: 'CLEAR_ALL'; payload: string }
  | { type: 'SET_OPEN_ALERT'; payload: boolean }
  | { type: 'SET_PAGINATION'; payload: { page: number; pageSize: number } };

const initialCheckInState: CheckInState = {
  currentStudents: [],
  normalStudents: [],
  pageSize: 0,
  currentPage: 0,
  isPresentCheckAll: false,
  isAbsentCheckAll: false,
  isPresentCheck: [],
  isAbsentCheck: [],
  defaultClassroom: null,
  classrooms: null,
  reportCheckIn: null,
  loading: true,
  openAlert: true,
};

function checkInReducer(state: CheckInState, action: CheckInAction): CheckInState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLASSROOM_LOADED': {
      const { classroom, classrooms, flatStudents, pageSize } = action.payload;
      return {
        ...state,
        defaultClassroom: classroom,
        classrooms,
        currentStudents: flatStudents,
        normalStudents: flatStudents.filter((s: any) => s?.status !== 'internship'),
        pageSize,
        currentPage: 0,
        loading: false,
      };
    }
    case 'SELECT_CLASSROOM':
      return {
        ...state,
        currentStudents: action.payload.students,
        defaultClassroom: action.payload.classroom,
        currentPage: 0,
        openAlert: true,
        isPresentCheckAll: false,
        isAbsentCheckAll: false,
        isPresentCheck: [],
        isAbsentCheck: [],
      };
    case 'SET_REPORT_CHECK_IN':
      return { ...state, reportCheckIn: action.payload, loading: false };
    case 'TOGGLE_PRESENT':
      return { ...state, isPresentCheck: action.payload };
    case 'TOGGLE_ABSENT':
      return { ...state, isAbsentCheck: action.payload };
    case 'TOGGLE_PRESENT_ALL':
      return { ...state, isPresentCheckAll: action.payload.all, isPresentCheck: action.payload.check };
    case 'TOGGLE_ABSENT_ALL':
      return { ...state, isAbsentCheckAll: action.payload.all, isAbsentCheck: action.payload.check };
    case 'CLEAR_ALL':
      return {
        ...state,
        ...(action.payload !== 'present' ? { isPresentCheckAll: false, isPresentCheck: [] } : {}),
        ...(action.payload !== 'absent' ? { isAbsentCheckAll: false, isAbsentCheck: [] } : {}),
      };
    case 'SET_OPEN_ALERT':
      return { ...state, openAlert: action.payload };
    case 'SET_PAGINATION':
      return { ...state, currentPage: action.payload.page, pageSize: action.payload.pageSize };
    default:
      return state;
  }
}

// ── StudentCard ───────────────────────────────────────────────────────────────

interface StudentCardProps {
  student: any;
  isMobile: boolean;
  isPresentCheck: any[];
  isAbsentCheck: any[];
  onHandleToggle: (action: string, student: any) => void;
}

const StudentCard = ({ student, isMobile, isPresentCheck, isAbsentCheck, onHandleToggle }: StudentCardProps) => (
  <Card sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
    <CardContent sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <RenderAvatar row={student} />
        <Box sx={{ ml: isMobile ? 1.5 : 2, flex: 1 }}>
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
            {student?.title} {student?.firstName} {student?.lastName}
          </Typography>
          <Typography variant='body2' sx={{
            color: 'text.secondary'
          }}>
            @{student?.studentId}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 1, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
        <Button
          variant={isPresentCheck.includes(student.id) ? 'contained' : 'outlined'}
          color='success'
          size={isMobile ? 'small' : 'medium'}
          onClick={() => onHandleToggle('present', student)}
          fullWidth
          disabled={student.status === 'internship'}
          sx={{ flex: isMobile ? 'none' : 1, minWidth: isMobile ? 'auto' : '120px', fontSize: isMobile ? '0.8rem' : '0.875rem' }}
        >
          เข้าร่วม
        </Button>
        <Button
          variant={isAbsentCheck.includes(student.id) ? 'contained' : 'outlined'}
          color='error'
          size={isMobile ? 'small' : 'medium'}
          onClick={() => onHandleToggle('absent', student)}
          fullWidth
          disabled={student.status === 'internship'}
          sx={{ flex: isMobile ? 'none' : 1, minWidth: isMobile ? 'auto' : '120px', fontSize: isMobile ? '0.8rem' : '0.875rem' }}
        >
          ไม่เข้าร่วม
        </Button>
      </Box>
    </CardContent>
  </Card>
);

// ── CheckInStatusAlert ────────────────────────────────────────────────────────

interface CheckInStatusAlertProps {
  isMobile: boolean;
  reportCheckIn: any;
  openAlert: boolean;
  onClose: () => void;
}

const CheckInStatusAlert = ({ isMobile, reportCheckIn, openAlert, onClose }: CheckInStatusAlertProps) => {
  if (!openAlert) return null;
  const isCheckedIn = reportCheckIn && !isEmpty(reportCheckIn) && reportCheckIn.id;
  return (
    <Grid sx={{ mb: isMobile ? 2 : 3 }} size={12}>
      <Alert
        severity={isCheckedIn ? 'success' : 'error'}
        sx={{ '& a': { fontWeight: 400 }, fontSize: isMobile ? '0.875rem' : '1rem' }}
        action={
          <IconButton size='small' color='inherit' aria-label='close' onClick={onClose}>
            <Close fontSize='inherit' />
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontSize: isMobile ? '1rem' : '1.1rem' }}>
          {isCheckedIn ? 'เช็คชื่อร่วมกิจกรรมเรียบร้อยแล้ว' : 'ยังไม่มีการเช็คชื่อร่วมกิจกรรม'}
        </AlertTitle>
      </Alert>
    </Grid>
  );
};

// ── CheckInDesktopGrid ────────────────────────────────────────────────────────

interface CheckInCheckState {
  isPresentCheck: any[];
  isAbsentCheck: any[];
  isPresentCheckAll: boolean;
  isAbsentCheckAll: boolean;
  normalStudents: any[];
}

interface CheckInDesktopGridProps {
  rows: any[];
  isCheckedIn: boolean;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  checkState: CheckInCheckState;
  onHandleToggle: (action: string, student: any) => void;
  onHandleCheckAll: (action: string) => void;
  onPaginationChange: (model: { page: number; pageSize: number }) => void;
}

const CheckInDesktopGrid = ({
  rows, isCheckedIn, loading, currentPage, pageSize,
  checkState, onHandleToggle, onHandleCheckAll, onPaginationChange,
}: CheckInDesktopGridProps) => {
  const { isPresentCheck, isAbsentCheck, isPresentCheckAll, isAbsentCheckAll, normalStudents } = checkState;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const timer = useRef<any>(null);
  const popperRef = useRef<HTMLDivElement | null>(null);
  const openPopper = Boolean(anchorEl);

  const handleMouseEnter = () => {
    if (timer.current) clearTimeout(timer.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timer.current = setTimeout(() => setIsHovered(false), 2000);
  };

  const handleCellClick: GridEventListener<'cellClick'> = (params: any) => {
    if (params.row.status !== 'internship') onHandleToggle(params.field, params.row);
  };

  const handleColumnHeaderClick: GridEventListener<'columnHeaderClick'> = (params: any) => {
    onHandleCheckAll(params.field);
  };

  const handlePopperOpen = (event: any) => {
    const id = event.currentTarget.dataset.id;
    const row = normalStudents.find((item: any) => item.id === id);
    setAnchorEl(isEmpty(row) ? event.currentTarget : null);
  };

  const handlePopperClose = (event: any) => {
    if (anchorEl == null || popperRef.current?.contains(event.nativeEvent.relatedTarget)) return;
    setAnchorEl(null);
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      flex: isTablet ? 0.3 : 0.25,
      minWidth: isMobile ? 200 : 220,
      field: 'fullName',
      headerName: 'ชื่อ-สกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RenderAvatar row={row} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}>
              {row?.title + '' + row?.firstName + ' ' + row?.lastName}
            </Typography>
            <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
              <Typography
                noWrap
                variant='caption'
                sx={{ textDecoration: 'none' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                @{row?.studentId}
              </Typography>
              {isHovered && (
                <Tooltip title='คัดลอกไปยังคลิปบอร์ด' placement='top'>
                  <span>
                    <IconButton
                      size='small'
                      sx={{ p: 0, ml: 0 }}
                      onClick={() => {
                        navigator.clipboard.writeText(row?.studentId);
                        toast.success('คัดลอกไปยังคลิปบอร์ดเรียบร้อยแล้ว');
                      }}
                    >
                      <IconifyIcon
                        icon='pajamas:copy-to-clipboard'
                        color={`${theme.palette.grey[500]}`}
                        width={16}
                        height={16}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Box>
      ),
    },
    {
      flex: isTablet ? 0.25 : 0.2,
      minWidth: isMobile ? 100 : 110,
      field: 'present',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckboxStyled
            color='success'
            checked={isPresentCheckAll || false}
            onChange={() => onHandleCheckAll('present')}
            icon={<IconifyIcon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <IconifyIcon
                fontSize='1.5rem'
                icon={isPresentCheck.length === normalStudents.length
                  ? 'material-symbols:check-box-rounded'
                  : 'material-symbols:indeterminate-check-box-rounded'}
              />
            }
          />
          <Typography variant='body2'>เข้าร่วม</Typography>
        </Box>
      ),
      renderCell: ({ row }: CellType) => (
        <Checkbox
          color='success'
          checked={isPresentCheck.includes(row.id) || false}
          onChange={() => onHandleToggle('present', row)}
          disabled={row.status === 'internship'}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      flex: isTablet ? 0.25 : 0.2,
      minWidth: isMobile ? 100 : 110,
      field: 'absent',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckboxStyled
            color='error'
            checked={isAbsentCheckAll || false}
            onChange={() => onHandleCheckAll('absent')}
            icon={<IconifyIcon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <IconifyIcon
                fontSize='1.5rem'
                icon={isAbsentCheck.length === normalStudents.length
                  ? 'material-symbols:check-box-rounded'
                  : 'material-symbols:indeterminate-check-box-rounded'}
              />
            }
          />
          <Typography variant='body2'>ไม่เข้าร่วม</Typography>
        </Box>
      ),
      renderCell: ({ row }: CellType) => (
        <Checkbox
          color='error'
          checked={isAbsentCheck.includes(row.id) || false}
          onChange={() => onHandleToggle('absent', row)}
          disabled={row.status === 'internship'}
          disableRipple
          disableFocusRipple
        />
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [isTablet, isMobile, isPresentCheck, isAbsentCheck, isPresentCheckAll, isAbsentCheckAll, normalStudents, isHovered, theme]);

  return (
    <>
      <DataGridCustom
        columns={columns}
        rows={rows}
        disableColumnMenu
        loading={loading}
        rowHeight={isTablet ? 70 : 80}
        getRowHeight={() => 'auto'}
        slots={{
          noRowsOverlay: isCheckedIn ? CustomNoRowsOverlayActivityCheckedIn : CustomNoRowsOverlay,
        }}
        onCellClick={handleCellClick}
        onColumnHeaderClick={handleColumnHeaderClick}
        slotProps={{
          row: {
            onMouseEnter: handlePopperOpen,
            onMouseLeave: handlePopperClose,
          },
        }}
        paginationModel={{ page: currentPage, pageSize: pageSize }}
        onPaginationModelChange={(model) => onPaginationChange({ page: model.page, pageSize: model.pageSize })}
        initialState={{
          pagination: { paginationModel: { page: currentPage, pageSize: pageSize } },
        }}
        pageSizeOptions={[10, 25, 50, 100, pageSize]}
        getRowClassName={(params) => (params.row.status === 'internship' ? 'internship' : 'normal')}
        sx={{
          p: isMobile ? 2 : 3,
          '& .MuiDataGrid-row': { '&:hover': { backgroundColor: 'action.hover' }, maxHeight: 'none !important' },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            lineHeight: 'unset !important',
            maxHeight: 'none !important',
            overflow: 'visible',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            fontSize: isMobile ? '0.75rem' : isTablet ? '0.8rem' : '0.875rem',
            padding: isMobile ? '8px' : '16px',
          },
          '& .MuiDataGrid-renderingZone': { maxHeight: 'none !important' },
        }}
      />
      <Popper
        ref={popperRef}
        open={openPopper}
        anchorEl={anchorEl}
        placement='auto'
        onMouseLeave={() => setAnchorEl(null)}
      >
        {() => (
          <Paper sx={{ transform: 'translateX(-140px)', zIndex: 100 }}>
            <Typography
              variant='subtitle1'
              sx={{
                color: 'primary.main',
                p: 2
              }}>
              ฝึกงาน
            </Typography>
          </Paper>
        )}
      </Popper>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const CheckInDailyReportPage = () => {
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const { getActivityCheckIn, addActivityCheckIn }: any = useActivityCheckInStore(
    (state) => ({
      getActivityCheckIn: state.getActivityCheckIn,
      addActivityCheckIn: state.addActivityCheckIn,
    }),
    shallow,
  );

  const {
    data: classroomData,
    isLoading: classroomLoading,
    error: classroomError,
  } = useTeacherClassroomsAndStudents(auth?.user?.teacher?.id || '');
  const ability = use(AbilityContext);
  const { push } = useRouter();

  const [state, dispatch] = useReducer(checkInReducer, initialCheckInState);
  const {
    currentStudents, normalStudents, pageSize, currentPage,
    isPresentCheckAll, isAbsentCheckAll, isPresentCheck, isAbsentCheck,
    defaultClassroom, classrooms, reportCheckIn, loading, openAlert,
  } = state;

  const getCheckInStatus = async (teacher: string, classroom: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await getActivityCheckIn({ teacher, classroom, date: toApiDate() });
      const hasData = data && typeof data === 'object' && Object.keys(data).length > 0 && data.id;
      dispatch({ type: 'SET_REPORT_CHECK_IN', payload: hasData ? data : null });
    } catch (error) {
      console.error('Error fetching check-in status:', error);
      dispatch({ type: 'SET_REPORT_CHECK_IN', payload: null });
    }
  };

  useEffectOnce(() => {
    if (!ability?.can('read', 'report-check-in-daily-page') || (auth?.user?.role as string) === 'Admin') {
      push('/401');
    }
  });

  useEffect(() => {
    if (classroomLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
      return;
    }
    if (classroomError) {
      console.error('Error loading classrooms:', classroomError);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลห้องเรียน');
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    if (!classroomData) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    let actualData = classroomData;
    if (classroomData?.data) {
      actualData = classroomData.data;
      if (actualData?.data) actualData = actualData.data;
    }

    const classroomList = Array.isArray(actualData) ? actualData : (actualData?.classrooms || []);
    if (!classroomList?.length) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const [classroom] = classroomList;
    if (!classroom) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    getCheckInStatus(auth?.user?.teacher?.id as string, classroom.id);

    const { students } = classroom;
    if (!students?.length) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const flatStudents = students.map((s: any) => {
      const account = s?.user?.account || {};
      return { ...s, firstName: account.firstName ?? s.firstName, lastName: account.lastName ?? s.lastName, title: account.title ?? s.title, avatar: account.avatar ?? s.avatar };
    });

    dispatch({ type: 'CLASSROOM_LOADED', payload: { classroom, classrooms: classroomList, flatStudents, pageSize: students.length } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomData, classroomLoading, classroomError, auth?.user?.teacher?.id]);

  const onSetToggle = (prevState: any, param: any): any => {
    const index = prevState.indexOf(param.id);
    if (index === -1) return [...prevState, param.id];
    return [...prevState.slice(0, index), ...prevState.slice(index + 1)];
  };

  const onRemoveToggle = (prevState: any, param: any): any => {
    const index = prevState.indexOf(param.id);
    if (index === -1) return prevState;
    return [...prevState.slice(0, index), ...prevState.slice(index + 1)];
  };

  const onHandleToggle = (action: string, param: any): void => {
    if (action === 'present') {
      dispatch({ type: 'TOGGLE_PRESENT', payload: onSetToggle(isPresentCheck, param) });
      if (isAbsentCheck.includes(param.id)) dispatch({ type: 'TOGGLE_ABSENT', payload: onRemoveToggle(isAbsentCheck, param) });
    } else if (action === 'absent') {
      dispatch({ type: 'TOGGLE_ABSENT', payload: onSetToggle(isAbsentCheck, param) });
      if (isPresentCheck.includes(param.id)) dispatch({ type: 'TOGGLE_PRESENT', payload: onRemoveToggle(isPresentCheck, param) });
    }
  };

  const onHandleCheckAll = (action: string): void => {
    if (action === 'present') {
      dispatch({ type: 'TOGGLE_PRESENT_ALL', payload: { all: !isPresentCheckAll, check: isPresentCheckAll ? [] : normalStudents.map((s: any) => s.id) } });
      dispatch({ type: 'CLEAR_ALL', payload: 'present' });
    } else if (action === 'absent') {
      dispatch({ type: 'TOGGLE_ABSENT_ALL', payload: { all: !isAbsentCheckAll, check: isAbsentCheckAll ? [] : normalStudents.map((s: any) => s.id) } });
      dispatch({ type: 'CLEAR_ALL', payload: 'absent' });
    }
  };

  const onHandleSubmit = async (event: any) => {
    event.preventDefault();
    const totalStudents = isPresentCheck.concat(isAbsentCheck).length;
    if (totalStudents === currentStudents.length && (!reportCheckIn || isEmpty(reportCheckIn) || !reportCheckIn.id)) {
      const toastId = toast.info('กำลังบันทึกเช็คชื่อ...', { autoClose: false, hideProgressBar: true });
      try {
        await addActivityCheckIn({
          teacherId: auth?.user?.teacher?.id,
          classroomId: defaultClassroom.id,
          present: isPresentCheck,
          absent: isAbsentCheck,
          checkInDate: new Date(),
          status: '1',
        });
        toast.dismiss(toastId);
        toast.success('บันทึกเช็คชื่อสำเร็จ');
      } catch {
        toast.dismiss(toastId);
        toast.error('เกิดข้อผิดพลาด');
      }
      getCheckInStatus(auth?.user?.teacher?.id as string, defaultClassroom?.id);
      dispatch({ type: 'CLEAR_ALL', payload: '' });
    } else {
      toast.error('กรุณาเช็คชื่อของนักเรียนทุกคนให้ครบถ้วน!');
    }
  };

  const handleSelectChange = async (event: any) => {
    event.preventDefault();
    const { target: { value } } = event;
    const classroomObj: any = classrooms.filter((item: any) => item.name === value)[0];
    await getCheckInStatus(auth?.user?.teacher?.id as string, classroomObj?.id);
    const flatStudents = (classroomObj.students || []).map((s: any) => {
      const account = s?.user?.account || {};
      return { ...s, firstName: account.firstName ?? s.firstName, lastName: account.lastName ?? s.lastName, title: account.title ?? s.title, avatar: account.avatar ?? s.avatar };
    });
    dispatch({ type: 'SELECT_CLASSROOM', payload: { classroom: classroomObj, students: flatStudents } });
  };

  const isCheckedIn = Boolean(reportCheckIn && !isEmpty(reportCheckIn) && reportCheckIn.id);
  const visibleStudents = isCheckedIn ? [] : (currentStudents ?? []);

  if (!ability?.can('read', 'report-check-in-daily-page') || (auth?.user?.role as string) === 'Admin') return null;

  return (
    <Fragment>
      <Grid container spacing={isMobile ? 4 : 6}>
        <Grid size={12}>
          <Card>
            <CardHeader
              avatar={<Avatar sx={{ color: 'primary.secondary' }} aria-label='recipe'><HiFlag /></Avatar>}
              sx={{ color: 'text.primary' }}
              title='รายงานการเช็คชื่อกิจกรรมรายวัน'
              subheader={thaiDateFormatter.format(new Date())}
              suppressHydrationWarning
              slotProps={{
                title: { variant: isMobile ? 'h6' : 'h5', fontSize: isMobile ? '1.1rem' : '1.25rem' },
                subheader: { variant: isMobile ? 'body2' : 'body1' },
              }}
            />
            <CardContent sx={{ p: isMobile ? 3 : undefined }}>
              {!isEmpty(currentStudents) && (
                <>
                  <Typography
                    variant={isMobile ? 'subtitle2' : 'subtitle1'}
                    sx={{ pb: 3, fontSize: isMobile ? '0.9rem' : '1rem', textAlign: isMobile ? 'center' : 'left' }}
                  >
                    {`ชั้น ${defaultClassroom?.name} จำนวน ${currentStudents.length} คน`}
                  </Typography>
                  <CheckInStatusAlert
                    isMobile={isMobile}
                    reportCheckIn={reportCheckIn}
                    openAlert={openAlert}
                    onClose={() => dispatch({ type: 'SET_OPEN_ALERT', payload: false })}
                  />
                </>
              )}
            </CardContent>
            <Box sx={{ p: isMobile ? 2 : 3 }}>
              <TableHeader
                value={classrooms}
                handleChange={handleSelectChange}
                defaultValue={defaultClassroom?.name ?? ''}
                handleSubmit={onHandleSubmit}
              />
            </Box>
            {isMobile ? (
              <Box sx={{ mt: 2 }}>
                {visibleStudents.map((student: any) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    isMobile={isMobile}
                    isPresentCheck={isPresentCheck}
                    isAbsentCheck={isAbsentCheck}
                    onHandleToggle={onHandleToggle}
                  />
                ))}
              </Box>
            ) : (
              <CheckInDesktopGrid
                rows={visibleStudents}
                isCheckedIn={isCheckedIn}
                loading={loading}
                currentPage={currentPage}
                pageSize={pageSize}
                checkState={{ isPresentCheck, isAbsentCheck, isPresentCheckAll, isAbsentCheckAll, normalStudents }}
                onHandleToggle={onHandleToggle}
                onHandleCheckAll={onHandleCheckAll}
                onPaginationChange={(model) => dispatch({ type: 'SET_PAGINATION', payload: model })}
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default CheckInDailyReportPage;
