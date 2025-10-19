'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { RiContactsBookLine, RiUserSearchLine, RiUserUnfollowLine } from 'react-icons/ri';
import { useClassroomStore, useStudentStore } from '@/store/index';
import { useDebounce, useEffectOnce } from '@/hooks/userCommon';

import { AccountEditOutline } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import Link from 'next/link';
import { LocalStorageService } from '@/services/localStorageService';
import RenderAvatar from '@/@core/components/avatar';
import { SelectChangeEvent } from '@mui/material/Select';
import TableHeader from '@/views/apps/student/list/TableHeader';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import useStudentList from '@/hooks/useStudentList';

const localStorage = new LocalStorageService();
const accessToken = localStorage.getToken() || '';
interface CellType {
  row: any;
}

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const StudentListPage = () => {
  // ** Hooks
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const classroom = searchParams.get('classroom');

  // ** State
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentClassroomId, setCurrentClassroomId] = useState<any>(null);
  const [initClassroom, setInitClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [loadingClassroom, setLoadingClassroom] = useState<boolean>(false);
  const [students, setStudents] = useState<any>([]);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState<boolean>(false);
  const [deletedStudent, setDeletedStudent] = useState<any>(null);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<any>({ fullName: '', studentId: '' });
  const debouncedValue = useDebounce<string>(searchValue, 500);

  const { fetchStudentsWithParams }: any = useStudentStore(
    (state: any) => ({
      fetchStudentsWithParams: state.fetchStudentsWithParams,
    }),
    shallow,
  );
  const { fetchClassroom }: any = useClassroomStore((state) => ({ fetchClassroom: state.fetchClassroom }), shallow);
  const { removeStudents }: any = useStudentStore((state) => ({ removeStudents: state.removeStudents }), shallow);
  const { loading: loadingStudents, students: studentsListData } = useStudentList(accessToken, debouncedValue);

  useEffectOnce(() => {
    (async () => {
      setLoadingClassroom(true);
      fetchClassroom(accessToken).then(async (res: any) => {
        // Check if res is valid array
        if (!res || !Array.isArray(res)) {
          setClassrooms([]);
          setLoadingClassroom(false);
          return;
        }

        if (user?.role?.toLowerCase() === 'admin') {
          setClassrooms(res);
          if (classroom) {
            const filteredClassroom = res.filter((item: any) => item.id === classroom);
            setInitClassroom(filteredClassroom[0] || null);
            setCurrentClassroomId(filteredClassroom[0]?.id || null);
          } else {
            // Set first classroom as default
            setInitClassroom(res[0] || null);
            setCurrentClassroomId(res[0]?.id || null);
          }
        } else {
          const teacherClassroom = res.filter((item: any) => user?.teacherOnClassroom?.includes(item.id));
          setClassrooms(teacherClassroom);
          if (classroom) {
            const currentQueryClassroom = teacherClassroom.filter((item: any) => item.id === classroom);
            setInitClassroom(currentQueryClassroom[0] || null);
            setCurrentClassroomId(currentQueryClassroom[0]?.id || null);
          } else {
            // Set first classroom as default
            setInitClassroom(teacherClassroom[0] || null);
            setCurrentClassroomId(teacherClassroom[0]?.id || null);
          }
        }
        setLoadingClassroom(false);
      });
    })();
  });

  useEffect(() => {
    setLoadingStudent(true);
    (async () => {
      const query = {
        classroomId: currentClassroomId,
        search: debouncedValue,
      };

      await fetchStudentsWithParams(accessToken, query).then(async (res: any) => {
        setStudents((await res) || []);
        setLoadingStudent(false);
      });
    })();
  }, [currentClassroomId, debouncedValue]);

  const onHandleChangeClassroom = (e: SelectChangeEvent, value: any) => {
    e.preventDefault();
    setCurrentClassroomId(value?.id);
    setInitClassroom(value);
  };

  const handDeletedConfirm = async (event: any) => {
    event.stopPropagation();
    setOpenDeletedConfirm(false);
    setStudents([]);
    setLoadingStudent(true);
    const toastId = toast.loading('กำลังลบข้อมูล...');
    await removeStudents(accessToken, deletedStudent.id).then((res: any) => {
      if (res?.status === 204) {
        toast.success('ลบข้อมูลสำเร็จ', { id: toastId });
      } else {
        toast.error(res?.response?.data.error || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });

    await fetchStudentsWithParams(accessToken, currentClassroomId).then(async (res: any) => {
      setStudents(await res);
      setLoadingStudent(false);
    });
  };

  const onHandleChangeFullName = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setCurrentStudent(newValue || null);
    },
    [setCurrentStudent],
  );

  const onSearchChange = useCallback(
    (event: any, value: any, reason: any) => {
      setSearchValue({ ...searchValue, fullName: value });
    },
    [setSearchValue, searchValue],
  );

  const onHandleStudentId = useCallback(
    (value: any) => {
      setSearchValue({ ...searchValue, studentId: value });
    },
    [setSearchValue, searchValue],
  );

  const defaultColumns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 230,
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { id, account, username } = row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderAvatar row={account} storedToken={accessToken} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                variant='body2'
                sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
              >
                {account?.title + '' + account?.firstName + ' ' + account?.lastName}
              </Typography>

              <Typography noWrap variant='caption' sx={{ textDecoration: 'none' }}>
                @{username}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      flex: 0.3,
      field: 'classroom',
      minWidth: 300,
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { student } = row;
        return (
          <Typography noWrap variant='body2'>
            {student?.classroom?.name}
          </Typography>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'edited',
      headerName: 'แก้ไข',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        return (
          <LinkStyled
            href={`/apps/student/edit/${row?.id}?classroom=${currentClassroomId}&token=${accessToken}`}
            passHref
          >
            <Button color='warning' variant='contained' startIcon={<AccountEditOutline fontSize='small' />}>
              แก้ไข
            </Button>
          </LinkStyled>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 120,
      headerName: 'ลบข้อมูล',
      field: 'delete',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const onHandleDelete = (event: any): void => {
          event.stopPropagation();
          setOpenDeletedConfirm(true);
          setDeletedStudent(row);
        };
        return (
          <Button
            color='error'
            variant='contained'
            startIcon={<RiUserUnfollowLine fontSize='small' />}
            onClick={onHandleDelete}
          >
            ลบ
          </Button>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 120,
      sortable: false,
      field: 'details',
      headerName: 'ดูรายละเอียด',
      align: 'center',
      renderCell: () => {
        return (
          <Button disabled color='primary' variant='contained' startIcon={<RiUserSearchLine fontSize='small' />}>
            ดู
          </Button>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <RiContactsBookLine />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title={`รายชื่อนักเรียนทั้งหมด ${students?.length ?? 0} คน`}
            />
            <TableHeader
              classrooms={classrooms}
              defaultClassroom={initClassroom}
              fullName={currentStudent}
              loading={loadingClassroom}
              loadingStudents={loadingStudents}
              onHandleChange={onHandleChangeClassroom}
              onHandleChangeStudent={onHandleChangeFullName}
              onHandleStudentId={onHandleStudentId}
              onSearchChange={onSearchChange}
              studentId={searchValue.studentId}
              students={studentsListData}
            />
            <DataGrid
              rows={students}
              columns={defaultColumns}
              loading={loadingStudent}
              disableRowSelectionOnClick
              disableColumnMenu
              getRowHeight={() => 'auto'}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: pageSize, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              onPaginationModelChange={(model) => setPageSize(model.pageSize)}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
              }}
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
          </Card>
        </Grid>
      </Grid>
      {openDeletedConfirm && (
        <React.Fragment>
          <Dialog
            open={openDeletedConfirm}
            disableEscapeKeyDown
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            onClose={(event: any, reason: any) => {
              if (reason !== 'backdropClick') {
                setOpenDeletedConfirm(false);
              }
            }}
          >
            <DialogTitle id='alert-dialog-title'>ยืนยันการลบข้อมูล</DialogTitle>
            <DialogContent>
              <DialogContentText id='alert-dialog-description'>
                {`คุณต้องการลบข้อมูลของ ${deletedStudent?.account?.title}${deletedStudent?.account?.firstName} ${deletedStudent?.account?.lastName} 
            ใช่หรือไม่?`}
              </DialogContentText>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
              <Button color='secondary' onClick={() => setOpenDeletedConfirm(false)}>
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
  );
};

StudentListPage.acl = {
  action: 'read',
  subject: 'student-list-pages',
};

export default StudentListPage;
