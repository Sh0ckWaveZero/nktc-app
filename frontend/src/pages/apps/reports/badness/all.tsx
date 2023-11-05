import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Dialog,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Fragment, useCallback, useContext, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CloseIcon from '@mui/icons-material/Close';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { HiThumbDown } from 'react-icons/hi';
import IconifyIcon from '@/@core/components/icon';
import TableHeader from '@/views/apps/reports/goodness/TableHeader';
import TimelineBadness from '@/views/apps/student/view/TimelineBadness';
import { badnessIndividualStore } from '@/store/index';
import { deepOrange } from '@mui/material/colors';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/userCommon';
import useFetchClassrooms from '@/hooks/useFetchClassrooms';
import useStudentList from '@/hooks/useStudentList';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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

const ReportAllBadness = () => {
  // ** Hooks
  const auth = useAuth();
  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;
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
  const [pageSize, setPageSize] = useState<number>(isEmpty(currentStudents) ? 0 : currentStudents.length);
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [selectedDate, setDateSelected] = useState<Dayjs | null>(dayjs(new Date()));
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<any>({ fullName: '' });
  const debouncedValue = useDebounce<string>(searchValue, 500);
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<any>(null);
  const [info, setInfo] = useState<any>(null);

  const [classrooms, classroomLoading] = useFetchClassrooms(storedToken);
  const { loading: loadingStudents, students: studentsListData } = useStudentList(storedToken, debouncedValue);

  const onChangeDate = useCallback((value: any) => {
    setDateSelected(value);
  }, []);

  const onSearch = async () => {
    try {
      setLoadingStudent(true);
      const response = await search(storedToken, {
        fullName: currentStudent?.fullName || '',
        classroomId: defaultClassroom?.id || '',
        badDate: selectedDate,
      });
      setCurrentStudents(response?.data);
      setLoadingStudent(false);
    } catch (error: any) {
      toast.error(error?.message);
      setLoadingStudent(false);
    }
  };

  const onClear = useCallback(() => {
    setCurrentStudents([]);
    setCurrentStudent(null);
    setDateSelected(null);
    setDefaultClassroom(null);
    setInfo(null);
  }, [setCurrentStudent, selectedDate, setDefaultClassroom]);

  const onHandleChangeStudent = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setCurrentStudent(newValue || null);
    },
    [setCurrentStudent],
  );

  const onSearchChange = useCallback((event: any, value: any) => {
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

  const columns: GridColumns = [
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
      field: 'classroomName',
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
                startIcon={<IconifyIcon icon={'mdi:timeline-check-outline'} width={20} height={20} />}
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
      field: 'score',
      headerName: 'คะแนนรวม',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
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
    ability?.can('read', 'report-goodness-page') &&
    auth?.user?.role !== 'Admin' && (
      <Fragment>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
              <TableHeader
                classroomLoading={classroomLoading as boolean}
                classrooms={classrooms}
                datePickLabel='วันที่บันทึกพฤติกรรมที่ไม่เหมาะสม'
                defaultClassroom={defaultClassroom}
                fullName={currentStudent}
                loadingStudents={loadingStudents}
                onChangeDate={onChangeDate}
                onClear={onClear}
                onHandleChangeStudent={onHandleChangeStudent}
                onHandleClassroomChange={onHandleClassroomChange}
                onSearch={onSearch}
                onSearchChange={onSearchChange}
                selectDate={selectedDate}
                students={studentsListData}
              />
              <DataGrid
                autoHeight
                columns={columns}
                rows={currentStudents ?? []}
                disableColumnMenu
                loading={loadingStudent}
                rowsPerPageOptions={[pageSize, 10, 20, 50, 100]}
                onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
                components={{
                  NoRowsOverlay: CustomNoRowsOverlay,
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
      </Fragment>
    )
  );
};

ReportAllBadness.acl = {
  action: 'read',
  subject: 'report-badness-page',
};

export default ReportAllBadness;
