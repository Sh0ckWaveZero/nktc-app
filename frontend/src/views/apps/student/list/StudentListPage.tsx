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
import React from 'react';
import { RiContactsBookLine, RiUserSearchLine, RiUserUnfollowLine } from 'react-icons/ri';

import { AccountEditOutline } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import Link from 'next/link';
import RenderAvatar from '@/@core/components/avatar';
import TableHeader from '@/views/apps/student/list/TableHeader';
import { styled } from '@mui/material/styles';
import { useStudentList } from '@/hooks/features/student';

interface CellType {
  row: any;
}

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const StudentListPage = () => {
  // Custom hook containing all business logic
  const {
    // Classroom state
    classrooms,
    initClassroom,
    currentClassroomId,
    loadingClassroom,

    // Student state
    students,
    loadingStudent,
    currentStudent,
    searchValue,

    // Delete dialog state
    openDeletedConfirm,
    deletedStudent,

    // Pagination
    pageSize,
    setPageSize,

    // Handlers
    handleChangeClassroom,
    handleChangeFullName,
    handleSearchChange,
    handleStudentId,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useStudentList();

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
            <RenderAvatar row={account} />
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
            href={`/apps/student/edit/${row?.id}?classroom=${currentClassroomId}`}
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
          handleDeleteClick(row);
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
              loadingStudents={loadingStudent}
              onHandleChange={handleChangeClassroom}
              onHandleChangeStudent={handleChangeFullName}
              onHandleStudentId={handleStudentId}
              onSearchChange={handleSearchChange}
              studentId={searchValue.studentId}
              students={students}
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
                handleDeleteCancel();
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
              <Button color='secondary' onClick={handleDeleteCancel}>
                ยกเลิก
              </Button>
              <Button variant='outlined' color='error' onClick={handleDeleteConfirm}>
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
