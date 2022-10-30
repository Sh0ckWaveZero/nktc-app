// ** React Imports
import { useState, ReactElement, useEffect } from 'react';

// ** Next Import
import Link from 'next/link';

// ** MUI Imports
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';

// ** Icons Imports
import Laptop from 'mdi-material-ui/Laptop';
import ChartDonut from 'mdi-material-ui/ChartDonut';
import CogOutline from 'mdi-material-ui/CogOutline';
import PencilOutline from 'mdi-material-ui/PencilOutline';
import AccountOutline from 'mdi-material-ui/AccountOutline';

// ** Custom Components Imports
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Utils Import
import { getInitials } from '@/@core/utils/get-initials';

import { Avatar, Box, Button, Card, CardHeader, Grid, Typography } from '@mui/material';
import { useClassroomStore, useStudentStore, useUserStore } from '@/store/index';
import shallow from 'zustand/shallow';
import TableHeader from '@/views/apps/student/list/TableHeader';
import { RiContactsBookLine, RiUserSearchLine, RiUserUnfollowLine } from 'react-icons/ri';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { useEffectOnce } from '@/hooks/userCommon';
import { AccountEditOutline } from 'mdi-material-ui';

interface UserRoleType {
  [key: string]: ReactElement;
}

interface UserStatusType {
  [key: string]: any;
}

// ** Vars
const userRoleObj: UserRoleType = {
  admin: <Laptop fontSize='small' sx={{ mr: 3, color: 'error.main' }} />,
  author: <CogOutline fontSize='small' sx={{ mr: 3, color: 'warning.main' }} />,
  editor: <PencilOutline fontSize='small' sx={{ mr: 3, color: 'info.main' }} />,
  maintainer: <ChartDonut fontSize='small' sx={{ mr: 3, color: 'success.main' }} />,
  subscriber: <AccountOutline fontSize='small' sx={{ mr: 3, color: 'primary.main' }} />,
};

interface CellType {
  row: any;
}

const userStatusObj: UserStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary',
};

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
            <Link href={`/apps/user/view/${id}`} passHref>
              <Typography
                noWrap
                component='a'
                variant='body2'
                sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
              >
                {account?.title + '' + account?.firstName + ' ' + account?.lastName}
              </Typography>
            </Link>
            <Link href={`/apps/user/view/${id}`} passHref>
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
      return (
        <Button
          disabled
          color='warning'
          variant='contained'
          startIcon={<AccountEditOutline fontSize='small' />}
          onClick={() => {}}
        >
          แก้ไข
        </Button>
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
      return (
        <Button
          disabled
          color='error'
          variant='contained'
          startIcon={<RiUserUnfollowLine fontSize='small' />}
          onClick={() => {}}
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
    renderCell: ({ row }: CellType) => {
      return (
        <Button
          disabled
          color='primary'
          variant='contained'
          startIcon={<RiUserSearchLine fontSize='small' />}
          onClick={() => {}}
        >
          ดู
        </Button>
      );
    },
  },
];

const StudentList = () => {
  // ** State
  const [value, setValue] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentClassroom, setCurrentClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [loadingClassroom, setLoadingClassroom] = useState<boolean>(false);
  const [students, setStudents] = useState<any>([]);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);

  // ** Hooks
  const { fetchStudentByClassroom } = useStudentStore(
    (state: any) => ({
      fetchStudentByClassroom: state.fetchStudentByClassroom,
    }),
    shallow,
  );
  const { fetchClassroom } = useClassroomStore((state) => ({ fetchClassroom: state.fetchClassroom }), shallow);

  const { accessToken } = useUserStore(
    (state: any) => ({
      accessToken: state.accessToken,
    }),
    shallow,
  );

  useEffectOnce(() => {
    const fetch = async () => {
      setLoadingClassroom(true);
      fetchClassroom(accessToken).then(async (res: any) => {
        setClassrooms(await res);
        setLoadingClassroom(false);
      });
    };
    fetch();
  });

  useEffect(() => {
    const fetch = async () => {
      setLoadingStudent(true);
      await fetchStudentByClassroom(accessToken, currentClassroom).then(async (res: any) => {
        setStudents(await res);
        setLoadingStudent(false);
      });
    };
    fetch();
  }, [currentClassroom]);

  const onHandleChangeClassroom = (e: SelectChangeEvent, value: any) => {
    e.preventDefault();
    setCurrentClassroom(value?.id);
  };

  return (
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
            title={`รายชื่อนักเรียนทั้งหมด`}
          />
          {classrooms && (
            <TableHeader
              value={value}
              classrooms={classrooms}
              onHandleChange={onHandleChangeClassroom}
              loading={loadingClassroom}
            />
          )}
          <DataGrid
            autoHeight
            rows={students}
            checkboxSelection
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
  );
};

StudentList.acl = {
  action: 'read',
  subject: 'student-list-pages',
};

export default StudentList;
