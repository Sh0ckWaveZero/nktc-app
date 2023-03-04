import {
  Avatar,
  Card,
  CardHeader,
  CircularProgress,
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
import { LocalStorageService } from '@/services/localStorageService';
import TableHeader from '@/views/apps/reports/goodness/TableHeader';
import { badnessIndividualStore } from '@/store/index';
import { deepOrange } from '@mui/material/colors';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/userCommon';
import useFetchClassrooms from '@/hooks/useFetchClassrooms';
import useGetImage from '@/hooks/useGetImage';
import useStudentList from '@/hooks/useStudentList';

interface CellType {
  row: any;
}

const localStorageService = new LocalStorageService();

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
  const storedToken = localStorageService.getToken()!;
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
      setCurrentStudents(response);
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
  }, [setCurrentStudent, selectedDate, setDefaultClassroom]);

  const onHandleChangeStudent = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setCurrentStudent(newValue || null);
    },
    [setCurrentStudent],
  );

  const onSearchChange = useCallback((event: any, value: any, reason: any) => {
    setSearchValue({ fullName: value });
  }, []);

  const onHandleClassroomChange = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setDefaultClassroom(newValue || null);
    },
    [setDefaultClassroom],
  );

  const handleClickOpen = () => {
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
        const { student } = row;
        const account = student?.user?.account || {};
        const studentName = account.title + '' + account.firstName + ' ' + account.lastName;
        return (
          <Tooltip title={studentName} arrow>
            <span>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
              >
                {studentName}
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
        const { classroom } = row;
        return (
          <Tooltip title={classroom?.name} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {classroom?.name}
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
        const { badnessDetail } = row;

        return (
          <Tooltip title={badnessDetail} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {badnessDetail}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 80,
      field: 'score',
      headerName: 'คะแนน',
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
    {
      flex: 0.15,
      minWidth: 160,
      field: 'image',
      headerName: 'รูปภาพ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { image, badnessDetail } = row;

        const { isLoading, error, image: badnessImage } = useGetImage(image, storedToken);

        return isLoading ? (
          <CircularProgress />
        ) : badnessImage ? (
          <div
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              setCurrentImage(badnessImage);
              handleClickOpen();
            }}
          >
            <img
              src={badnessImage as any}
              alt={badnessDetail || 'บันทึกพฤติกรรมที่ไม่เหมาะสม'}
              width='150'
              height='200'
            />
          </div>
        ) : (
          <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            ไม่มีรูปภาพ
          </Typography>
        );
      },
    },
    {
      flex: 0.12,
      minWidth: 100,
      field: 'createDate',
      headerName: 'วันที่บันทึก',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { badDate, createdAt } = row;
        return (
          <Tooltip
            title={new Date(badDate || createdAt).toLocaleTimeString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            arrow
          >
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {
                  new Date(badDate || createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) /* แสดงวันที่เป็นภาษาไทย */
                }
              </Typography>
            </span>
          </Tooltip>
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
                getRowClassName={(params) => {
                  const { status } = params.row.student;
                  return status === 'internship' ? 'internship' : 'normal';
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <BootstrapDialog onClose={handleClose} aria-labelledby='บรรทึกความดี' open={open}>
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
          <img src={currentImage as any} alt='บันทึกพฤติกรรมที่ไม่เหมาะสม' width='100%' height='100%' />
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
