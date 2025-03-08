import { Avatar, Box, Button, Card, CardHeader, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Fragment, useState } from 'react';

import { AccountEditOutline } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import DialogAddCard from '@/views/apps/record-badness/DialogAddCard';
import { HiOutlineThumbDown } from 'react-icons/hi';
import Link from 'next/link';
import TableHeader from '@/views/apps/record-goodness/TableHeader';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import { useStudentStore } from '@/store/index';
import RenderAvatar from '@/@core/components/avatar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Grid from '@mui/material/Grid2';

interface CellType {
  row: any;
}

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const RecordBadnessIndividual = () => {
  // ** Hooks
  const { user } = useAuth();
  const useLocal = useLocalStorage();

  const accessToken = useLocal.getToken()!;

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
            <RenderAvatar row={row} storedToken={accessToken} />
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
      field: 'recordBadnessIndividualLatest',
      headerName: 'บันทึกพฤติกรรมที่ไม่เหมาะสมล่าสุด',
      align: 'left',
      renderCell: ({ row }: CellType) => {
        const { student } = row;
        const badnessIndividualLatest = isEmpty(student?.badnessIndividual)
          ? '-'
          : new Date(student?.badnessIndividual[0]?.createdAt).toLocaleTimeString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
        return (
          <Typography noWrap variant='body2'>
            {badnessIndividualLatest}
          </Typography>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'recordBadnessIndividual',
      headerName: 'บันทึกพฤติกรรมที่ไม่เหมาะสม',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        return (
          <Button
            color='error'
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
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <HiOutlineThumbDown />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title={`บันทึกพฤติกรรมที่ไม่เหมาะสม ${students ? students.length : 0} คน`}
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
              paginationModel={{ page: 0, pageSize }}
              disableRowSelectionOnClick
              columns={defaultColumns}
              loading={loadingStudent}
              pageSizeOptions={[10, 25, 50]}
              onPaginationModelChange={(paginationModel) => setPageSize(paginationModel.pageSize)}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
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

RecordBadnessIndividual.acl = {
  action: 'read',
  subject: 'record-badness-page',
};

export default RecordBadnessIndividual;
