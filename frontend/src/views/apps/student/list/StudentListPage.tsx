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
import { styled } from '@mui/material/styles';
import React, { memo, useMemo, useCallback } from 'react';
import { RiContactsBookLine, RiUserSearchLine, RiUserUnfollowLine } from 'react-icons/ri';
import { AccountEditOutline } from 'mdi-material-ui';
import Link from 'next/link';

import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import RenderAvatar from '@/@core/components/avatar';
import TableHeader from '@/views/apps/student/list/TableHeader';
import { useStudentList } from '@/hooks/features/student';

// ─── Styled Components ────────────────────────────────────────────────────────

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-row': {
    maxHeight: 'none !important',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
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
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

const StudentNameCell = memo(({ row }: { row: any }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <RenderAvatar row={row.user?.account} />
    <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
      <Typography noWrap variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
        {row.user?.account?.title + '' + row.user?.account?.firstName + ' ' + row.user?.account?.lastName}
      </Typography>
      <Typography noWrap variant='caption'>
        @{row.user?.username}
      </Typography>
    </Box>
  </Box>
));

interface StudentDeleteDialogProps {
  open: boolean;
  student: any;
  onConfirm: (event: any) => void;
  onCancel: () => void;
}

const StudentDeleteDialog = memo(({ open, student, onConfirm, onCancel }: StudentDeleteDialogProps) => (
  <Dialog
    open={open}
    disableEscapeKeyDown
    aria-labelledby='alert-dialog-title'
    aria-describedby='alert-dialog-description'
    onClose={(_, reason) => {
      if (reason !== 'backdropClick') onCancel();
    }}
  >
    <DialogTitle id='alert-dialog-title'>ยืนยันการลบข้อมูล</DialogTitle>
    <DialogContent>
      <DialogContentText id='alert-dialog-description'>
        {`คุณต้องการลบข้อมูลของ ${student?.user?.account?.title}${student?.user?.account?.firstName} ${student?.user?.account?.lastName} ใช่หรือไม่?`}
      </DialogContentText>
    </DialogContent>
    <DialogActions className='dialog-actions-dense'>
      <Button color='secondary' onClick={onCancel}>
        ยกเลิก
      </Button>
      <Button variant='outlined' color='error' onClick={onConfirm}>
        ยืนยัน
      </Button>
    </DialogActions>
  </Dialog>
));

// ─── Main Component ───────────────────────────────────────────────────────────

const StudentListPage = () => {
  const {
    classrooms,
    initClassroom,
    currentClassroomId,
    loadingClassroom,
    students,
    loadingStudent,
    currentStudent,
    searchValue,
    openDeletedConfirm,
    deletedStudent,
    pageSize,
    setPageSize,
    handleChangeClassroom,
    handleChangeFullName,
    handleSearchChange,
    handleStudentId,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useStudentList();

  const handlePaginationModelChange = useCallback(
    (model: { pageSize: number; page: number }) => setPageSize(model.pageSize),
    [setPageSize],
  );

  const columns: GridColDef[] = useMemo(() => [
    {
      flex: 0.25,
      minWidth: 230,
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }) => <StudentNameCell row={row} />,
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
      renderCell: ({ row }) => (
        <Typography noWrap variant='body2'>
          {row.classroom?.name}
        </Typography>
      ),
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
      renderCell: ({ row }) => (
        <LinkStyled href={`/apps/student/edit/${row?.id}?classroom=${currentClassroomId}`} passHref>
          <Button color='warning' variant='contained' startIcon={<AccountEditOutline fontSize='small' />}>
            แก้ไข
          </Button>
        </LinkStyled>
      ),
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'delete',
      headerName: 'ลบข้อมูล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      align: 'center',
      renderCell: ({ row }) => (
        <Button
          color='error'
          variant='contained'
          startIcon={<RiUserUnfollowLine fontSize='small' />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row);
          }}
        >
          ลบ
        </Button>
      ),
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'details',
      headerName: 'ดูรายละเอียด',
      sortable: false,
      align: 'center',
      renderCell: () => (
        <Button disabled color='primary' variant='contained' startIcon={<RiUserSearchLine fontSize='small' />}>
          ดู
        </Button>
      ),
    },
  ], [currentClassroomId, handleDeleteClick]);

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
            <StyledDataGrid
              rows={students}
              columns={columns}
              loading={loadingStudent}
              disableRowSelectionOnClick
              disableColumnMenu
              getRowHeight={() => 'auto'}
              initialState={{
                pagination: {
                  paginationModel: { pageSize, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              onPaginationModelChange={handlePaginationModelChange}
              slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            />
          </Card>
        </Grid>
      </Grid>
      {openDeletedConfirm && (
        <StudentDeleteDialog
          open={openDeletedConfirm}
          student={deletedStudent}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </React.Fragment>
  );
};

StudentListPage.acl = {
  action: 'read',
  subject: 'student-list-pages',
};

export default StudentListPage;
