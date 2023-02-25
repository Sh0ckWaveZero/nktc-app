import { Avatar, Card, CardHeader, Grid, Typography, styled, CircularProgress } from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Fragment, useCallback, useContext, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { Dayjs } from 'dayjs';
import { HiStar } from 'react-icons/hi';
import { LocalStorageService } from '@/services/localStorageService';
import TableHeader from '@/views/apps/reports/goodness/TableHeader';
import { isEmpty } from '@/@core/utils/utils';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/userCommon';
import useFetchClassrooms from '@/hooks/useFetchClassrooms';
import { useRouter } from 'next/router';
import useStudentList from '@/hooks/useStudentList';
import { shallow } from 'zustand/shallow';
import { goodnessIndividualStore } from '@/store/index';
import toast from 'react-hot-toast';
import useGetImage from '@/hooks/useGetImage';

interface CellType {
  row: any;
}

const localStorageService = new LocalStorageService();
const DataGridCustom = styled(DataGrid)(({ theme }) => ({
  // dynamic row height based on text content
  '& .MuiDataGrid-renderingZone': {
    maxHeight: 'none !important',
  },
  '& .MuiDataGrid-cell': {
    lineHeight: 'unset !important',
    maxHeight: 'none !important',
    whiteSpace: 'normal',
  },
  '& .MuiDataGrid-row': {
    maxHeight: 'none !important',
  },
}));

const ReportAllGoodness = () => {
  // ** Hooks
  const auth = useAuth();
  const storedToken = localStorageService.getToken()!;
  const ability = useContext(AbilityContext);

  const { search }: any = goodnessIndividualStore(
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
  const [selectedDate, setDateSelected] = useState<Dayjs | null>(null);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedValue = useDebounce<string>(searchValue, 500);

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
        classroomId: defaultClassroom,
        goodDate: selectedDate,
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
    setSearchValue(value);
  }, []);

  const onHandleClassroomChange = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setDefaultClassroom(newValue || null);
    },
    [setDefaultClassroom],
  );

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
      field: 'classroomName',
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { classroom } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {classroom?.name}
          </Typography>
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
        const { goodnessDetail } = row;

        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {goodnessDetail}
          </Typography>
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
        const { goodnessScore } = row;
        return (
          // Show score in row table
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {goodnessScore}
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
        const { image } = row;

        const { isLoading, error, image: goodnessImage } = useGetImage(image, storedToken);
        return isLoading ? (
          <CircularProgress />
        ) : (
          <div>
            <img src={goodnessImage as any} alt='image' width='150' height='200' />
          </div>
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
        const { goodDate, createdAt } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {
              new Date(goodDate || createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }) /* แสดงวันที่เป็นภาษาไทย */
            }
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
                    <HiStar
                      style={{
                        color: '#e6c406',
                      }}
                    />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`รายงานการบันทึกความดี`}
              />
              <TableHeader
                fullName={currentStudent}
                selectDate={selectedDate}
                onChangeDate={onChangeDate}
                onSearch={onSearch}
                onClear={onClear}
                defaultClassroom={defaultClassroom}
                classrooms={classrooms}
                onHandleClassroomChange={onHandleClassroomChange}
                classroomLoading={classroomLoading as boolean}
                students={studentsListData}
                loadingStudents={loadingStudents}
                onHandleChangeStudent={onHandleChangeStudent}
                onSearchChange={onSearchChange}
              />
              <DataGridCustom
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
      </Fragment>
    )
  );
};

ReportAllGoodness.acl = {
  action: 'read',
  subject: 'report-goodness-page',
};

export default ReportAllGoodness;
