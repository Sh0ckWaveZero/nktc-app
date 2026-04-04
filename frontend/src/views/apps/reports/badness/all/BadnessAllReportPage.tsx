'use client';

import {
  Avatar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardHeader,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useCallback, useContext, useDeferredValue, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CloseIcon from '@mui/icons-material/Close';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { HiThumbDown } from 'react-icons/hi';
import Icon from '@/@core/components/icon';
import TimelineBadness from '@/views/apps/student/view/TimelineBadness';
import { badnessIndividualStore } from '@/store/index';
import { deepOrange } from '@mui/material/colors';
import { shallow } from 'zustand/shallow';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useClassrooms, useTeacherClassrooms, useStudentsSearch } from '@/hooks/queries';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

interface CellType {
  row: any;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const BadnessAllReportPage = () => {
  // ** Hooks
  const auth = useAuth();
  const ability = useContext(AbilityContext);

  const { search }: any = badnessIndividualStore(
    (state: any) => ({
      search: state.search,
    }),
    shallow,
  );

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [selectedDate, setDateSelected] = useState<Date | null>(new Date());
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<any>({ fullName: '' });
  const deferredValue = useDeferredValue(searchValue);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<any>(null);

  // React Query hooks
  // Use teacher-specific classrooms for Teacher role, otherwise use all classrooms
  const isTeacher = auth?.user?.role === 'Teacher';
  const teacherId = auth?.user?.teacher?.teacherId;

  const { data: teacherClassrooms = [], isLoading: teacherClassroomLoading } = useTeacherClassrooms(
    isTeacher && teacherId ? teacherId : '',
  );
  const { data: allClassrooms = [], isLoading: allClassroomLoading, error: classroomError } = useClassrooms();

  const classrooms = isTeacher && teacherId ? teacherClassrooms : allClassrooms;
  const classroomLoading = isTeacher && teacherId ? teacherClassroomLoading : allClassroomLoading;

  const {
    data: studentsListData = [],
    isLoading: loadingStudents,
    error: studentsError,
  } = useStudentsSearch({
    q: deferredValue,
  });

  // Show error toast if queries fail
  if (classroomError) {
    toast.error('เกิดข้อผิดพลาดในการโหลดห้องเรียน');
  }
  if (studentsError) {
    toast.error((studentsError as any)?.message || 'เกิดข้อผิดพลาดในการค้นหานักเรียน');
  }

  const onChangeDate = useCallback((value: any) => {
    setDateSelected(value);
  }, []);

  const onSearch = async () => {
    try {
      setLoadingStudent(true);

      // Build fullName from student object
      let fullName = '';
      if (currentStudent?.user?.account) {
        const { title = '', firstName = '', lastName = '' } = currentStudent.user.account;
        fullName = `${title}${firstName} ${lastName}`.trim();
      } else if (currentStudent?.fullName) {
        fullName = currentStudent.fullName;
      }

      // Get student ID if available
      const studentId = currentStudent?.studentId || currentStudent?.id || '';

      const requestBody = {
        fullName: fullName || undefined, // Only send if not empty
        studentId: studentId || undefined, // Only send if not empty
        classroomId: defaultClassroom?.id || '',
        badDate: selectedDate,
      };

      console.log('🔍 Badness Search Request:', requestBody);
      console.log('🧑 Current Student Object:', currentStudent);
      console.log('🏫 Current Classroom Object:', defaultClassroom);

      const response = await search(requestBody);
      console.log('📦 Badness Search Response:', response);
      console.log('📊 Response.data:', response?.data);
      console.log('📊 Response.data length:', response?.data?.length);

      setCurrentStudents(response?.data || []);

      if (!response?.data || response?.data?.length === 0) {
        toast.info('ไม่พบข้อมูลพฤติกรรมไม่เหมาะสมในช่วงเวลาที่เลือก');
      }

      setLoadingStudent(false);
    } catch (error: any) {
      console.error('❌ Search Error:', error);
      console.error('Error details:', error?.response?.data);
      toast.error(error?.response?.data?.message || error?.message || 'ไม่สามารถค้นหาข้อมูลได้');
      setLoadingStudent(false);
    }
  };

  const onClear = useCallback(() => {
    setCurrentStudents([]);
    setCurrentStudent(null);
    setDateSelected(null);
    setDefaultClassroom(null);
    setInfo(null);
  }, [setCurrentStudent, setDefaultClassroom]);

  const onHandleChangeStudent = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      console.log('👤 Student Selected:', newValue);
      setCurrentStudent(newValue || null);
    },
    [setCurrentStudent],
  );

  const onSearchChange = useCallback((_event: any, value: any, _reason: any) => {
    setSearchValue({ fullName: value });
  }, []);

  const onHandleClassroomChange = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setDefaultClassroom(newValue || null);
    },
    [setDefaultClassroom],
  );

  const handleClickOpen = (value: any) => {
    setInfo(value);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const columns: GridColDef[] = [
    {
      flex: 0.13,
      minWidth: 160,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { studentId } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {studentId}
          </Typography>
        );
      },
    },
    {
      flex: 0.17,
      minWidth: 150,
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { fullName } = row;
        return (
          <Tooltip title={fullName} arrow>
            <span>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
              >
                {fullName}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'name',
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { name } = row;
        return (
          <Tooltip title={name} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {name}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'detail',
      headerName: 'รายละเอียด',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { info } = row;
        return (
          <Tooltip title={'รายละเอียด'} arrow>
            <span>
              <Button
                aria-label='more'
                aria-controls='long-menu'
                aria-haspopup='true'
                onClick={() => handleClickOpen(info)}
                variant='contained'
                startIcon={<Icon icon={'mdi:timeline-check-outline'} width={20} height={20} />}
                size='medium'
                color='error'
                sx={{ color: 'text.secondary' }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                  รายละเอียด
                </Typography>
              </Button>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 80,
      field: 'badnessScore',
      headerName: 'คะแนนรวม',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { badnessScore } = row;
        return (
          <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {badnessScore}
          </Typography>
        );
      },
    },
  ];

  return (
    ability?.can('read', 'report-badness-page') &&
    auth?.user?.role !== 'Admin' && (
      <React.Fragment>
        <Grid container spacing={6}>
          <Grid size={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <HiThumbDown
                      style={{
                        color: deepOrange[800],
                      }}
                    />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`รายงานการบันทึกพฤติกรรมที่ไม่เหมาะสม`}
              />
              <Box
                sx={{
                  p: { xs: 4, sm: 6 },
                  mb: 8,
                  borderRadius: 4,
                  bgcolor: (theme) => (theme.palette.mode === 'light' ? 'background.paper' : 'background.default'),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: (theme) =>
                    `0 8px 32px -4px ${hexToRGBA(theme.palette.mode === 'light' ? '#3A3541' : '#000000', 0.08)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: (theme) =>
                      `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 6, gap: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: (theme) => hexToRGBA(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      display: 'flex',
                    }}
                  >
                    <Icon icon='mdi:filter-variant' fontSize='1.5rem' />
                  </Box>
                  <Box>
                    <Typography variant='h6' sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                      ตัวกรองข้อมูล
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      ค้นหาและสรุปรายงานพฤติกรรมไม่เหมาะสม
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={6} sx={{ alignItems: 'flex-start' }}>
                  <Grid size={{ xs: 12, md: 3.5 }}>
                    <FormControl fullWidth>
                      <Autocomplete
                        id='badness-report-student-autocomplete'
                        value={currentStudent || null}
                        options={Array.isArray(studentsListData) ? studentsListData : []}
                        loading={loadingStudents}
                        onInputChange={(event, newInputValue, reason) => {
                          if (reason !== 'blur' && reason !== 'reset') {
                            onSearchChange(event, newInputValue, reason);
                          }
                        }}
                        onChange={(e, newValue) => onHandleChangeStudent(e, newValue)}
                        getOptionLabel={(option: any) => {
                          if (typeof option === 'string') return option;
                          const account = option?.user?.account || option?.account;
                          if (account) {
                            const { title = '', firstName = '', lastName = '' } = account;
                            const label = `${title}${firstName} ${lastName}`.trim();
                            if (label) return label;
                          }
                          if (option?.fullName) {
                            return `${option?.title || ''}${option.fullName}`;
                          }
                          return option?.studentId || option?.id || '';
                        }}
                        isOptionEqualToValue={(option: any, val: any) => {
                          if (!option || !val) return false;
                          return option.id === val.id;
                        }}
                        renderOption={(props, option: any) => {
                          const account = option?.user?.account || option?.account;
                          let displayText = '';
                          if (account) {
                            const { title = '', firstName = '', lastName = '' } = account;
                            displayText = `${title}${firstName} ${lastName}`.trim();
                          } else if (option?.fullName) {
                            displayText = `${option?.title || ''}${option.fullName}`;
                          } else {
                            displayText = option?.studentId || option?.id || '';
                          }
                          return (
                            <li {...props}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Icon icon='mdi:account-outline' fontSize='1.25rem' color='primary.main' />
                                <Box>
                                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                    {displayText}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {option.studentId || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </li>
                          );
                        }}
                        slotProps={{
                          listbox: { sx: { maxHeight: 400, p: 2 } },
                          popper: { sx: { zIndex: 1300 } },
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='ค้นหารายชื่อนักเรียน'
                            placeholder='ระบุชื่อ หรือ รหัสประจำตัว'
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <Icon
                                      icon='mdi:account-search-outline'
                                      fontSize='1.25rem'
                                      style={{ marginRight: 8, opacity: 0.6 }}
                                    />
                                    {params.InputProps.startAdornment}
                                  </>
                                ),
                                sx: { height: { xs: 44, sm: 48 }, borderRadius: 2, bgcolor: 'background.paper' },
                              },
                              inputLabel: {
                                shrink: true,
                                sx: { fontWeight: 600, transform: 'translate(14px, -9px) scale(0.75)' },
                              },
                            }}
                          />
                        )}
                        noOptionsText='ไม่พบรายชื่อนักเรียน'
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth>
                      <Autocomplete
                        id='badness-report-classroom-autocomplete'
                        value={defaultClassroom || null}
                        options={Array.isArray(classrooms) ? classrooms : []}
                        loading={classroomLoading}
                        onChange={onHandleClassroomChange}
                        getOptionLabel={(option: any) => option?.name ?? ''}
                        isOptionEqualToValue={(option: any, val: any) => option?.id === val?.id}
                        renderOption={(props, option: any) => (
                          <li {...props}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Icon icon='mdi:google-classroom' fontSize='1.2rem' color='info.main' />
                              {option.name}
                            </Box>
                          </li>
                        )}
                        slotProps={{ popper: { sx: { zIndex: 1300 } } }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='ชั้นเรียน'
                            placeholder='เลือกชั้นเรียน'
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                startAdornment: (
                                  <Icon
                                    icon='mdi:google-classroom'
                                    fontSize='1.25rem'
                                    style={{ marginRight: 8, opacity: 0.6 }}
                                  />
                                ),
                                sx: { height: { xs: 44, sm: 48 }, borderRadius: 2, bgcolor: 'background.paper' },
                              },
                              inputLabel: {
                                shrink: true,
                                sx: { fontWeight: 600, transform: 'translate(14px, -9px) scale(0.75)' },
                              },
                            }}
                          />
                        )}
                        noOptionsText='ไม่พบข้อมูลชั้นเรียน'
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 2.5 }}>
                    <FormControl fullWidth>
                      <ThaiDatePicker
                        label='วันที่บันทึกพฤติกรรมที่ไม่เหมาะสม'
                        value={selectedDate}
                        onChange={onChangeDate}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: 'ระบุวันที่',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                height: { xs: 44, sm: 48 },
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                              },
                              '& .MuiInputLabel-root': {
                                fontWeight: 600,
                                transform: 'translate(14px, -9px) scale(0.75)',
                              },
                            },
                            slotProps: {
                              input: {
                                startAdornment: (
                                  <Icon
                                    icon='mdi:calendar-range'
                                    fontSize='1.25rem'
                                    style={{ marginRight: 8, opacity: 0.6 }}
                                  />
                                ),
                              },
                            },
                          },
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Button
                        fullWidth
                        variant='contained'
                        onClick={onSearch}
                        disabled={loadingStudent}
                        startIcon={<Icon icon='mdi:magnify' />}
                        sx={{
                          height: { xs: 44, sm: 48 },
                          borderRadius: 2.5,
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          textTransform: 'none',
                          boxShadow: (theme) => `0 8px 24px ${hexToRGBA(theme.palette.primary.main, 0.25)}`,
                          background: (theme) =>
                            `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: (theme) => `0 12px 32px ${hexToRGBA(theme.palette.primary.main, 0.4)}`,
                          },
                          '&:active': { transform: 'translateY(0)' },
                        }}
                      >
                        แสดงรายงาน
                      </Button>
                      <Tooltip title='ล้างค่าทั้งหมด' arrow>
                        <Button
                          variant='outlined'
                          color='secondary'
                          onClick={onClear}
                          sx={{
                            minWidth: { xs: 44, sm: 48 },
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            borderRadius: 2.5,
                            p: 0,
                            bgcolor: (theme) => hexToRGBA(theme.palette.secondary.main, 0.05),
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              bgcolor: (theme) => hexToRGBA(theme.palette.secondary.main, 0.1),
                              borderColor: 'secondary.main',
                              color: 'secondary.main',
                            },
                          }}
                        >
                          <Icon icon='mdi:filter-off-outline' fontSize='1.25rem' />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <DataGrid
                columns={columns}
                rows={currentStudents ?? []}
                getRowId={(row) => row.id || row.studentId}
                disableColumnMenu
                loading={loadingStudent}
                rowHeight={80}
                getRowHeight={() => 'auto'}
                slots={{
                  noRowsOverlay: CustomNoRowsOverlay,
                }}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                pageSizeOptions={[10, 20, 50, 100]}
                autoHeight
                sx={{
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
                  },
                  '& .MuiDataGrid-renderingZone': {
                    maxHeight: 'none !important',
                  },
                  '& .root': {
                    overflowX: 'hidden',
                  },
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <BootstrapDialog fullWidth maxWidth='sm' onClose={handleClose} aria-labelledby='คะแนนตามความพฤติ' open={open}>
          {handleClose ? (
            <IconButton
              aria-label='close'
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
          <TimelineBadness info={info} user={auth} />
        </BootstrapDialog>
      </React.Fragment>
    )
  );
};

export default BadnessAllReportPage;
