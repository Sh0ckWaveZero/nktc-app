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
  Container,
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
import React, { Fragment, useContext, useRef, useState } from 'react';
import { useActivityCheckInStore, useTeacherStore } from '@/store/index';

import { AbilityContext } from '@/layouts/components/acl/Can';
import { Close } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { CustomNoRowsOverlayActivityCheckedIn } from '@/@core/components/check-in/checkedIn';
import { HiFlag } from 'react-icons/hi';
import IconifyIcon from '@/@core/components/icon';
import { LocalStorageService } from '@/services/localStorageService';
import RenderAvatar from '@/@core/components/avatar';
import TableHeader from '@/views/apps/reports/TableHeader';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffectOnce } from '@/hooks/userCommon';
import { useRouter } from 'next/navigation';

interface CellType {
  row: any;
}

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

const CheckInDailyReportPage = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const alignCenter = useMediaQuery(theme.breakpoints.down('md')) ? 'center' : 'left';
  const storedToken = localStorageService.getToken()!;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const { getActivityCheckIn, addActivityCheckIn }: any = useActivityCheckInStore(
    (state) => ({
      getActivityCheckIn: state.getActivityCheckIn,
      addActivityCheckIn: state.addActivityCheckIn,
    }),
    shallow,
  );
  const { fetchStudentsByTeacherId }: any = useTeacherStore(
    (state) => ({ fetchStudentsByTeacherId: state.fetchStudentsByTeacherId }),
    shallow,
  );
  const ability = useContext(AbilityContext);
  const router = useRouter();

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [normalStudents, setNormalStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(currentStudents.length || 0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isPresentCheckAll, setIsPresentCheckAll] = useState(false);
  const [isAbsentCheckAll, setIsAbsentCheckAll] = useState(false);
  const [isPresentCheck, setIsPresentCheck] = useState<any>([]);
  const [isAbsentCheck, setIsAbsentCheck] = useState<any>([]);
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>(null);
  const [reportCheckIn, setReportCheckIn] = useState<any>(false);
  const [loading, setLoading] = useState(true);
  const [openAlert, setOpenAlert] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const timer: any = useRef(null);

  // ** Popper
  const popperRef = useRef<HTMLDivElement | null>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openPopper = Boolean(anchorEl);

  // ดึงข้อมูลห้องเรียนของครู
  useEffectOnce(() => {
    const fetchData = async () => {
      const teacherId = auth?.user?.teacher?.id as string;
      setLoading(true);
      const { data: classroomData } = await fetchStudentsByTeacherId(storedToken, teacherId);
      if (!classroomData.classrooms || !classroomData.classrooms.length) {
        setLoading(false);
        return;
      }

      const [classroom] = classroomData.classrooms;

      if (!classroom) {
        setLoading(false);
        return;
      }

      await getCheckInStatus(teacherId, classroom.id);
      const { students } = classroom;

      if (!students || !students.length) {
        return;
      }

      setDefaultClassroom(classroom);
      setClassrooms(classroomData.classrooms);
      setCurrentStudents(students);
      setNormalStudents(students.filter((student: any) => student?.status !== 'internship'));
      setPageSize(students.length);
      setCurrentPage(0); // Reset to first page when loading new data
      setLoading(false);
    };

    const isInRole = (auth?.user?.role as string) === 'Admin';
    if (!ability?.can('read', 'report-check-in-daily-page') || isInRole) {
      router.push('/401');
      return;
    }

    fetchData();
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
    params.row.status !== 'internship' ? onHandleToggle(params.field, params.row) : null;
  };

  const handleColumnHeaderClick: GridEventListener<'columnHeaderClick'> = (params: any) => {
    onHandleCheckAll(params.field);
  };

  const handleMouseEnter = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timer.current = setTimeout(() => {
      setIsHovered(false);
    }, 2000);
  };

  // Mobile Card Component
  const StudentCard = ({ student }: { student: any }) => {
    return (
      <Card sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <RenderAvatar row={student} storedToken={storedToken} />
            <Box sx={{ ml: isMobile ? 1.5 : 2, flex: 1 }}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
                {student?.title} {student?.firstName} {student?.lastName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                @{student?.studentId}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: isMobile ? 0.5 : 1,
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Button
              variant={isPresentCheck.includes(student.id) ? 'contained' : 'outlined'}
              color='success'
              size={isMobile ? 'small' : 'medium'}
              onClick={() => onHandleToggle('present', student)}
              fullWidth
              disabled={student.status === 'internship'}
              sx={{
                flex: isMobile ? 'none' : 1,
                minWidth: isMobile ? 'auto' : '120px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
              }}
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
              sx={{
                flex: isMobile ? 'none' : 1,
                minWidth: isMobile ? 'auto' : '120px',
                fontSize: isMobile ? '0.8rem' : '0.875rem',
              }}
            >
              ไม่เข้าร่วม
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const columns: GridColDef[] = [
    {
      flex: isTablet ? 0.3 : 0.25,
      minWidth: isMobile ? 200 : 220,
      field: 'fullName',
      headerName: 'ชื่อ-สกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderAvatar row={row} storedToken={storedToken} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                variant='body2'
                sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
              >
                {row?.title + '' + row?.firstName + ' ' + row?.lastName}
              </Typography>
              <Stack direction='row' alignItems='center' gap={1}>
                <Typography
                  noWrap
                  variant='caption'
                  sx={{
                    textDecoration: 'none',
                  }}
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
        );
      },
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
                icon={
                  isPresentCheck.length === normalStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
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
                icon={
                  isAbsentCheck.length === normalStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
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
    setCurrentPage(0); // Reset to first page when changing classroom
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
    if (anchorEl == null || popperRef.current?.contains(event.nativeEvent.relatedTarget)) {
      return;
    }
    setAnchorEl(null);
  };

  return (
    ability?.can('read', 'report-check-in-daily-page') &&
    (auth?.user?.role as string) !== 'Admin' && (
      <React.Fragment>
        <Grid container spacing={isMobile ? 4 : 6}>
          <Grid size={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <HiFlag />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`รายงานการเช็คชื่อกิจกรรมรายวัน`}
                subheader={`${new Date(Date.now()).toLocaleDateString('th-TH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}`}
                slotProps={{
                  title: {
                    variant: isMobile ? 'h6' : 'h5',
                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                  },
                  subheader: {
                    variant: isMobile ? 'body2' : 'body1',
                  },
                }}
              />
              <CardContent sx={{ p: isMobile ? 3 : undefined }}>
                {!isEmpty(currentStudents) && (
                  <>
                    <Typography
                      variant={isMobile ? 'subtitle2' : 'subtitle1'}
                      sx={{
                        pb: 3,
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        textAlign: isMobile ? 'center' : 'left',
                      }}
                    >{`ชั้น ${defaultClassroom?.name} จำนวน ${currentStudents.length} คน`}</Typography>
                    {isEmpty(reportCheckIn) ? (
                      openAlert ? (
                        <Grid sx={{ mb: isMobile ? 2 : 3 }} size={12}>
                          <Alert
                            severity='error'
                            sx={{
                              '& a': { fontWeight: 400 },
                              fontSize: isMobile ? '0.875rem' : '1rem',
                            }}
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
                            <AlertTitle sx={{ fontSize: isMobile ? '1rem' : '1.1rem' }}>
                              ยังไม่มีการเช็คชื่อร่วมกิจกรรม
                            </AlertTitle>
                          </Alert>
                        </Grid>
                      ) : null
                    ) : openAlert ? (
                      <Grid sx={{ mb: isMobile ? 2 : 3 }} size={12}>
                        <Alert
                          severity='success'
                          sx={{
                            '& a': { fontWeight: 400 },
                            fontSize: isMobile ? '0.875rem' : '1rem',
                          }}
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
                          <AlertTitle sx={{ fontSize: isMobile ? '1rem' : '1.1rem' }}>
                            เช็คชื่อร่วมกิจกรรมเรียบร้อยแล้ว
                          </AlertTitle>
                        </Alert>
                      </Grid>
                    ) : null}
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
              {/* Mobile View */}
              {isMobile ? (
                <Box sx={{ mt: 2 }}>
                  {(isEmpty(reportCheckIn) ? (currentStudents ?? []) : []).map((student: any) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </Box>
              ) : (
                /* Desktop View */
                <DataGridCustom
                  columns={columns}
                  rows={isEmpty(reportCheckIn) ? (currentStudents ?? []) : []}
                  disableColumnMenu
                  loading={loading}
                  rowHeight={isTablet ? 70 : 80}
                  getRowHeight={() => 'auto'}
                  slots={{
                    noRowsOverlay: isEmpty(reportCheckIn) ? CustomNoRowsOverlay : CustomNoRowsOverlayActivityCheckedIn,
                  }}
                  onCellClick={handleCellClick}
                  onColumnHeaderClick={handleColumnHeaderClick}
                  paginationModel={{ page: currentPage, pageSize: pageSize }}
                  onPaginationModelChange={(model) => {
                    setCurrentPage(model.page);
                    setPageSize(model.pageSize);
                  }}
                  initialState={{
                    pagination: {
                      paginationModel: { page: currentPage, pageSize: pageSize },
                    },
                  }}
                  pageSizeOptions={[10, 25, 50, 100, pageSize]}
                  getRowClassName={(params) => {
                    return params.row.status === 'internship' ? 'internship' : 'normal';
                  }}
                  sx={{
                    p: isMobile ? 2 : 3,
                    '& .MuiDataGrid-row': {
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      maxHeight: 'none !important',
                    },
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
                    '& .MuiDataGrid-renderingZone': {
                      maxHeight: 'none !important',
                    },
                  }}
                />
              )}
              <Popper
                ref={popperRef}
                open={openPopper}
                anchorEl={anchorEl}
                placement={'auto'}
                onMouseLeave={() => setAnchorEl(null)}
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
      </React.Fragment>
    )
  );
};

export default CheckInDailyReportPage;
