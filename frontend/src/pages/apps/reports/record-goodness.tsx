import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Fragment, useState } from 'react';
import { RiUserSearchLine, RiUserUnfollowLine } from 'react-icons/ri';
import { useStudentStore } from '@/store/index';

import { AccountEditOutline } from 'mdi-material-ui';
import CustomAvatar from '@/@core/components/mui/avatar';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { HiOutlineStar } from 'react-icons/hi';
import Link from 'next/link';
import { LocalStorageService } from '@/services/localStorageService';
import TableHeader from '@/views/apps/record-goodness/TableHeader';
import { getInitials } from '@/@core/utils/get-initials';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

interface CellType {
  row: any;
}

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

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
  console.log(row);
  if (row?.account?.avatar) {
    return (
      <AvatarWithImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar src={row?.account?.avatar} sx={{ mr: 3, width: 30, height: 30 }} />
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

const localStorageService = new LocalStorageService();

const RecordGoodness = () => {
  // ** Hooks
  const { user } = useAuth();
  const router = useRouter();
  const accessToken = localStorageService.getToken()!;

  // ** State
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentClassroomId, setCurrentClassroomId] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [students, setStudents] = useState<any>([]);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [studentId, setStudentId] = useState<any>('');

  // ** Store
  const { fetchStudents }: any = useStudentStore((state) => ({ fetchStudents: state.fetchStudents }), shallow);

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
              <LinkStyled href={`/apps/student/view/${id}`} passHref>
                <Typography
                  noWrap
                  variant='body2'
                  sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
                >
                  {account?.title + '' + account?.firstName + ' ' + account?.lastName}
                </Typography>
              </LinkStyled>
              <LinkStyled href={`/apps/student/view/${id}`} passHref>
                <Typography noWrap variant='caption' sx={{ textDecoration: 'none' }}>
                  @{username}
                </Typography>
              </LinkStyled>
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
        const accessToken = localStorageService.getToken()!;
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

  const handleOnSearch = () => {
    setLoadingStudent(true);
    const query = { fullName: fullName, studentId: studentId };
    console.log(JSON.stringify(query));
    (async () => {
      await fetchStudents(accessToken, query).then(async (res: any) => {
        setStudents((await res) || []);
        setLoadingStudent(false);
      });
    })();
  };

  const onClearSearch = () => {
    setFullName('');
    setStudentId('');
  };

  return (
    <Fragment>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <HiOutlineStar />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title={`บันทึกความดี ${students ? students.length : 0} คน`}
            />
            {classrooms && (
              <TableHeader
                fullName={fullName}
                id={studentId}
                onChangeFullName={(e: any) => setFullName(e.target.value)}
                onChangeId={(e: any) => setStudentId(e.target.value)}
                onSearch={handleOnSearch}
                onClear={onClearSearch}
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
    </Fragment>
  );
};

RecordGoodness.acl = {
  action: 'read',
  subject: 'record-goodness-page',
};

export default RecordGoodness;
