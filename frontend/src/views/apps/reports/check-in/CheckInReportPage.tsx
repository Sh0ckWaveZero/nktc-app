'use client';

import { Fragment, useContext, useState, useEffect } from 'react';
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
  Grid,
  IconButton,
  Stack,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { HiOutlineFlag } from 'react-icons/hi';
import { Close } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { shallow } from 'zustand/shallow';
import { useAuth } from '@/hooks/useAuth';
import { LocalStorageService } from '@/services/localStorageService';
import IconifyIcon from '@/@core/components/icon';
import RenderAvatar from '@/@core/components/avatar';
import toast from 'react-hot-toast';

interface CellType {
  row: any;
}

const localStorageService = new LocalStorageService();
const storedToken = localStorageService.getToken()!;

const CheckboxStyled = styled(Checkbox)<CheckboxProps>(() => ({
  padding: '0 0 0 4px',
}));

const CheckInReportPage = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const alignCenter = useMediaQuery(theme.breakpoints.down('md')) ? 'center' : 'left';
  const ability = useContext(AbilityContext);

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Check-in status states
  const [isPresentCheck, setIsPresentCheck] = useState<any>([]);
  const [isPresentCheckAll, setIsPresentCheckAll] = useState(false);
  const [isAbsentCheck, setIsAbsentCheck] = useState<any>([]);
  const [isAbsentCheckAll, setIsAbsentCheckAll] = useState(false);
  const [isLateCheck, setIsLateCheck] = useState<any>([]);
  const [isLateCheckAll, setIsLateCheckAll] = useState(false);
  const [isLeaveCheck, setIsLeaveCheck] = useState<any>([]);
  const [isLeaveCheckAll, setIsLeaveCheckAll] = useState(false);

  // Mock data for development
  useEffect(() => {
    const mockStudents = [
      { id: 1, studentId: '6501001', firstName: 'สมชาย', lastName: 'ใจดี', classroom: 'ปวช.1/1', avatar: '/images/avatars/1.png' },
      { id: 2, studentId: '6501002', firstName: 'สมหญิง', lastName: 'ใจงาม', classroom: 'ปวช.1/1', avatar: '/images/avatars/2.png' },
      { id: 3, studentId: '6501003', firstName: 'สมศักดิ์', lastName: 'ใจกล้า', classroom: 'ปวช.1/1', avatar: '/images/avatars/3.png' },
      { id: 4, studentId: '6501004', firstName: 'สมใจ', lastName: 'ใจเด็ด', classroom: 'ปวช.1/1', avatar: '/images/avatars/4.png' },
    ];
    setCurrentStudents(mockStudents);
  }, []);

  // Handle individual checkbox changes
  const handleCheckboxChange = (studentId: any, status: string) => {
    const setters = {
      present: setIsPresentCheck,
      absent: setIsAbsentCheck,
      late: setIsLateCheck,
      leave: setIsLeaveCheck
    };

    const currentChecked = {
      present: isPresentCheck,
      absent: isAbsentCheck,
      late: isLateCheck,
      leave: isLeaveCheck
    };

    const setter = setters[status as keyof typeof setters];
    const current = currentChecked[status as keyof typeof currentChecked];

    if (current.includes(studentId)) {
      setter(current.filter((id: any) => id !== studentId));
    } else {
      setter([...current, studentId]);
      // Clear other status checkboxes for this student
      Object.keys(setters).forEach(key => {
        if (key !== status) {
          const otherSetter = setters[key as keyof typeof setters];
          const otherCurrent = currentChecked[key as keyof typeof currentChecked];
          otherSetter(otherCurrent.filter((id: any) => id !== studentId));
        }
      });
    }
  };

  // Handle select all checkboxes
  const handleSelectAll = (status: string) => {
    const allStudentIds = currentStudents.map((student: any) => student.id);
    const setters = {
      present: { setter: setIsPresentCheck, allSetter: setIsPresentCheckAll, current: isPresentCheck, allState: isPresentCheckAll },
      absent: { setter: setIsAbsentCheck, allSetter: setIsAbsentCheckAll, current: isAbsentCheck, allState: isAbsentCheckAll },
      late: { setter: setIsLateCheck, allSetter: setIsLateCheckAll, current: isLateCheck, allState: isLateCheckAll },
      leave: { setter: setIsLeaveCheck, allSetter: setIsLeaveCheckAll, current: isLeaveCheck, allState: isLeaveCheckAll }
    };

    const statusConfig = setters[status as keyof typeof setters];
    
    if (statusConfig.allState) {
      statusConfig.setter([]);
      statusConfig.allSetter(false);
    } else {
      statusConfig.setter(allStudentIds);
      statusConfig.allSetter(true);
      // Clear other status checkboxes
      Object.keys(setters).forEach(key => {
        if (key !== status) {
          const otherConfig = setters[key as keyof typeof setters];
          otherConfig.setter([]);
          otherConfig.allSetter(false);
        }
      });
    }
  };

  const handleSaveCheckIn = () => {
    const checkInData = {
      date: checkInDate,
      classroom: selectedClassroom,
      present: isPresentCheck,
      absent: isAbsentCheck,
      late: isLateCheck,
      leave: isLeaveCheck
    };
    
    console.log('Check-in Data:', checkInData);
    toast.success('บันทึกข้อมูลการเช็คชื่อเรียบร้อยแล้ว');
  };

  const getStudentStatus = (studentId: any) => {
    if (isPresentCheck.includes(studentId)) return { status: 'มาเรียน', color: 'success' };
    if (isAbsentCheck.includes(studentId)) return { status: 'ขาดเรียน', color: 'error' };
    if (isLateCheck.includes(studentId)) return { status: 'มาสาย', color: 'warning' };
    if (isLeaveCheck.includes(studentId)) return { status: 'ลา', color: 'info' };
    return { status: 'ยังไม่เช็ค', color: 'default' };
  };

  const columns: GridColDef[] = [
    {
      field: 'student',
      headerName: 'นักเรียน',
      flex: 0.25,
      minWidth: 250,
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { id, studentId, firstName, lastName, avatar } = row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderAvatar src={avatar} alt={`${firstName} ${lastName}`} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', ml: 2 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {firstName} {lastName}
              </Typography>
              <Typography variant='caption'>{studentId}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'present',
      flex: 0.15,
      minWidth: 120,
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckboxStyled
            color='success'
            checked={isPresentCheckAll}
            onChange={() => handleSelectAll('present')}
            icon={<IconifyIcon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <IconifyIcon
                fontSize='1.5rem'
                icon={
                  isPresentCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
          <Typography variant='body2'>มาเรียน</Typography>
        </Box>
      ),
      renderCell: ({ row }: CellType) => (
        <Checkbox
          color='success'
          checked={isPresentCheck.includes(row.id)}
          onChange={() => handleCheckboxChange(row.id, 'present')}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      field: 'absent',
      flex: 0.15,
      minWidth: 120,
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckboxStyled
            color='error'
            checked={isAbsentCheckAll}
            onChange={() => handleSelectAll('absent')}
            icon={<IconifyIcon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <IconifyIcon
                fontSize='1.5rem'
                icon={
                  isAbsentCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
          <Typography variant='body2'>ขาดเรียน</Typography>
        </Box>
      ),
      renderCell: ({ row }: CellType) => (
        <Checkbox
          color='error'
          checked={isAbsentCheck.includes(row.id)}
          onChange={() => handleCheckboxChange(row.id, 'absent')}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      field: 'late',
      flex: 0.15,
      minWidth: 120,
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckboxStyled
            color='warning'
            checked={isLateCheckAll}
            onChange={() => handleSelectAll('late')}
            icon={<IconifyIcon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <IconifyIcon
                fontSize='1.5rem'
                icon={
                  isLateCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
          <Typography variant='body2'>มาสาย</Typography>
        </Box>
      ),
      renderCell: ({ row }: CellType) => (
        <Checkbox
          color='warning'
          checked={isLateCheck.includes(row.id)}
          onChange={() => handleCheckboxChange(row.id, 'late')}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      field: 'leave',
      flex: 0.15,
      minWidth: 120,
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckboxStyled
            color='info'
            checked={isLeaveCheckAll}
            onChange={() => handleSelectAll('leave')}
            icon={<IconifyIcon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <IconifyIcon
                fontSize='1.5rem'
                icon={
                  isLeaveCheck.length === currentStudents.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
          <Typography variant='body2'>ลา</Typography>
        </Box>
      ),
      renderCell: ({ row }: CellType) => (
        <Checkbox
          color='info'
          checked={isLeaveCheck.includes(row.id)}
          onChange={() => handleCheckboxChange(row.id, 'leave')}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      flex: 0.15,
      minWidth: 120,
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { status, color } = getStudentStatus(row.id);
        return (
          <Chip 
            label={status}
            color={color as any}
            size='small'
          />
        );
      },
    },
  ];

  return (
    <Fragment>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Alert severity='info'>
            <AlertTitle>การเช็คชื่อหน้าเสาธง</AlertTitle>
            เลือกชั้นเรียนและวันที่ แล้วทำการเช็คชื่อนักเรียนได้เลย
          </Alert>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }}>
                  <HiOutlineFlag />
                </Avatar>
              }
              title='รายงานการเช็คชื่อ'
              subheader='จัดการข้อมูลการเข้าเรียนของนักเรียน'
            />
            <CardContent>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>เลือกชั้นเรียน</InputLabel>
                    <Select
                      value={selectedClassroom}
                      onChange={(e) => setSelectedClassroom(e.target.value)}
                      label='เลือกชั้นเรียน'
                    >
                      <MenuItem value=''>ทั้งหมด</MenuItem>
                      <MenuItem value='ปวช.1/1'>ปวช.1/1</MenuItem>
                      <MenuItem value='ปวช.1/2'>ปวช.1/2</MenuItem>
                      <MenuItem value='ปวช.2/1'>ปวช.2/1</MenuItem>
                      <MenuItem value='ปวส.1/1'>ปวส.1/1</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <input
                      type='date'
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '16.5px 14px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant='contained' 
                      onClick={handleSaveCheckIn}
                      disabled={currentStudents.length === 0}
                    >
                      บันทึกการเช็คชื่อ
                    </Button>
                    <Button variant='outlined'>
                      ส่งออกรายงาน
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  autoHeight
                  rows={currentStudents}
                  columns={columns}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  hideFooterSelectedRowCount
                  loading={false}
                  headerHeight={120}
                  rowHeight={80}
                  getRowHeight={() => 'auto'}
                  slots={{
                    noRowsOverlay: CustomNoRowsOverlay,
                  }}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: pageSize },
                    },
                  }}
                  pageSizeOptions={[5, 10, 25, 50]}
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
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default CheckInReportPage;