// ** React Imports
import { useState, useEffect, Fragment } from 'react';

// ** Next Import
import Link from 'next/link';

// ** MUI Imports
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';

// ** Custom Components Imports
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Utils Import
import { getInitials } from '@/@core/utils/get-initials';

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
  Grid,
  Typography,
} from '@mui/material';
import { useClassroomStore, useStudentStore } from '@/store/index';
import shallow from 'zustand/shallow';
import TableHeader from '@/views/apps/student/list/TableHeader';
import { RiContactsBookLine, RiUserSearchLine, RiUserUnfollowLine } from 'react-icons/ri';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { useEffectOnce } from '@/hooks/userCommon';
import { AccountEditOutline } from 'mdi-material-ui';
import { authConfig } from '@/configs/auth';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

interface CellType {
  row: any;
}

// ** Styled component for the link for the avatar with image
const AvatarWithImageLink = styled(Link)(({ theme }) => ({
  marginRight: theme.spacing(3),
}));

// ** Styled component for the link for the avatar without image
const AvatarWithoutImageLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  marginRight: theme.spacing(3),
}));

// ** renders client column
const renderClient = (row: any) => {
  if (row?.avatar) {
    return (
      <AvatarWithImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar src={row.avatar} sx={{ mr: 3, width: 30, height: 30 }} />
      </AvatarWithImageLink>
    );
  } else {
    return (
      <AvatarWithoutImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar
          skin='light'
          color={row?.avatarColor || 'primary'}
          sx={{ mr: 3, width: 30, height: 30, fontSize: '.875rem' }}
        >
          {getInitials(row.account?.firstName + ' ' + row.account?.lastName)}
        </CustomAvatar>
      </AvatarWithoutImageLink>
    );
  }
};

const StudentList = () => {
  // ** Hooks
  const { user } = useAuth();
  const router = useRouter();
  const { classroom } = router.query;
  const accessToken = window.localStorage.getItem(authConfig.accessToken as string)!;

  // ** State
  const [value, setValue] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentClassroomId, setCurrentClassroomId] = useState<any>(null);
  const [initClassroom, setInitClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [loadingClassroom, setLoadingClassroom] = useState<boolean>(false);
  const [students, setStudents] = useState<any>([]);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState<boolean>(false);
  const [deletedStudent, setDeletedStudent] = useState<any>(null);

  const { fetchStudentByClassroom }: any = useStudentStore(
    (state: any) => ({
      fetchStudentByClassroom: state.fetchStudentByClassroom,
    }),
    shallow,
  );
  const { fetchClassroom }: any = useClassroomStore((state) => ({ fetchClassroom: state.fetchClassroom }), shallow);
  const { removeStudents }: any = useStudentStore((state) => ({ removeStudents: state.removeStudents }), shallow);

  useEffectOnce(() => {
    (async () => {
      setLoadingClassroom(true);
      fetchClassroom(accessToken).then(async (res: any) => {
        if (user?.role?.toLowerCase() === 'admin') {
          setClassrooms(await res);
          if (classroom) {
            setInitClassroom(await res.filter((item: any) => item.id === classroom).map((elm: any) => elm.id));
          }
        } else {
          const teacherClassroom = await res.filter((item: any) => user?.teacherOnClassroom?.includes(item.id));
          setClassrooms(teacherClassroom);
          if (classroom) {
            const currentQueryClassroom = await teacherClassroom.filter((item: any) => item.id === classroom);
            setInitClassroom(currentQueryClassroom[0]);
            setCurrentClassroomId(currentQueryClassroom[0].id);
          }
        }
        setLoadingClassroom(false);
      });
    })();
  });

  useEffect(() => {
    setLoadingStudent(true);
    (async () => {
      await fetchStudentByClassroom(accessToken, currentClassroomId).then(async (res: any) => {
        setStudents(await res);
        setLoadingStudent(false);
      });
    })();
  }, [currentClassroomId]);

  const defaultColumns: GridColumns = [
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
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Link href={`/apps/student/view/${id}`} passHref>
                <Typography
                  noWrap
                  component='a'
                  variant='body2'
                  sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
                >
                  {account?.title + '' + account?.firstName + ' ' + account?.lastName}
                </Typography>
              </Link>
              <Link href={`/apps/student/view/${id}`} passHref>
                <Typography noWrap component='a' variant='caption' sx={{ textDecoration: 'none' }}>
                  @{username}
                </Typography>
              </Link>
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
      headerName: 'แก้ไขล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const accessToken = window.localStorage.getItem(authConfig.accessToken as string)!;
        return (
          <Link href={`/apps/student/edit/${row?.id}?token=${accessToken}`} passHref>
            <Button color='warning' variant='contained' startIcon={<AccountEditOutline fontSize='small' />}>
              แก้ไข
            </Button>
          </Link>
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

    await fetchStudentByClassroom(accessToken, currentClassroomId).then(async (res: any) => {
      setStudents(await res);
      setLoadingStudent(false);
    });
  };

  return (
    <Fragment>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <RiContactsBookLine />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title={`รายชื่อนักเรียนทั้งหมด ${students ? students.length : 0} คน`}
            />
            {classrooms && (
              <TableHeader
                value={value}
                defaultClassroom={initClassroom}
                classrooms={classrooms}
                onHandleChange={onHandleChangeClassroom}
                loading={loadingClassroom}
              />
            )}
            <DataGrid
              autoHeight
              rows={students}
              pageSize={pageSize}
              disableSelectionOnClick
              columns={defaultColumns}
              loading={loadingStudent}
              rowsPerPageOptions={[10, 25, 50]}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              components={{
                NoRowsOverlay: CustomNoRowsOverlay,
              }}
              disableColumnMenu
            />
          </Card>
        </Grid>
      </Grid>
      {openDeletedConfirm && (
        <Fragment>
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
        </Fragment>
      )}
    </Fragment>
  );
};

StudentList.acl = {
  action: 'read',
  subject: 'student-list-pages',
};

export default StudentList;
