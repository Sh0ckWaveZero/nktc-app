import { Avatar, Box, Button, Card, CardHeader, CircularProgress, Grid, Typography } from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Fragment, useState } from 'react';

import { AccountEditOutline } from 'mdi-material-ui';
import CustomAvatar from '@/@core/components/mui/avatar';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import DialogAddCard from '@/views/apps/record-goodness/DialogAddCard';
import { HiOutlineStar } from 'react-icons/hi';
import Link from 'next/link';
import { LocalStorageService } from '@/services/localStorageService';
import TableHeader from '@/views/apps/record-goodness/TableHeader';
import { getInitials } from '@/@core/utils/get-initials';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import useGetImage from '@/hooks/useGetImage';
import { useStudentStore } from '@/store/index';

const accessToken = new LocalStorageService().getToken()!;
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
  if (row?.account?.avatar) {
    const { isLoading, image } = useGetImage(row?.account?.avatar, accessToken);
    return isLoading ? (
      <CircularProgress />
    ) : (
      <AvatarWithImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar src={image as string} sx={{ mr: 3, width: 40, height: 40 }} />
      </AvatarWithImageLink>
    );
  } else {
    return (
      <AvatarWithoutImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar
          skin='light'
          color={row?.avatarColor || 'primary'}
          sx={{ mr: 3, width: 40, height: 40, fontSize: '.875rem' }}
        >
          {getInitials(row.account?.firstName + ' ' + row.account?.lastName)}
        </CustomAvatar>
      </AvatarWithoutImageLink>
    );
  }
};

const localStorageService = new LocalStorageService();

const RecordGoodnessIndividual = () => {
  // ** Hooks
  const { user } = useAuth();
  const accessToken = localStorageService.getToken()!;

  // ** State
  const [pageSize, setPageSize] = useState<number>(10);
  const [students, setStudents] = useState<any>([]);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [studentId, setStudentId] = useState<any>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // ** Store
  const { fetchStudents }: any = useStudentStore((state) => ({ fetchStudents: state.fetchStudents }), shallow);

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
      flex: 0.2,
      minWidth: 120,
      sortable: false,
      field: 'recordGoodnessIndividualLatest',
      headerName: 'บันทึกความดีล่าสุด',
      align: 'left',
      renderCell: ({ row }: CellType) => {
        const { student } = row;
        const goodnessIndividualLatest = isEmpty(student?.goodnessIndividual)
          ? '-'
          : new Date(student?.goodnessIndividual[0]?.createdAt).toLocaleTimeString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
        return (
          <Typography noWrap variant='body2'>
            {goodnessIndividualLatest}
          </Typography>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'recordGoodnessIndividual',
      headerName: 'บันทึกความดี',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        return (
          <Button
            color='success'
            variant='contained'
            onClick={() => {
              setSelectedStudent(row);
              setOpenDialog(true);
            }}
            startIcon={<AccountEditOutline fontSize='small' />}
          >
            เพิ่ม
          </Button>
        );
      },
    },
  ];
  const handleOnSearch = () => {
    setLoadingStudent(true);
    const query = { fullName: fullName, studentId: studentId };
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
    setStudents([]);
    selectedStudent && setSelectedStudent(null);
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
            {students && (
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
      {openDialog && (
        <DialogAddCard
          show={openDialog}
          data={selectedStudent}
          handleClose={handleCloseDialog}
          user={user}
          handleOnSearch={handleOnSearch}
        />
      )}
    </Fragment>
  );
};

RecordGoodnessIndividual.acl = {
  action: 'read',
  subject: 'record-goodness-page',
};

export default RecordGoodnessIndividual;
