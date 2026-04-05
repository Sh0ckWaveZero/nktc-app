'use client';

import {
  Alert,
  AlertTitle,
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
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { alpha, styled } from '@mui/material/styles';
import React, { memo, useMemo, useCallback } from 'react';
import { RiContactsBookLine, RiUserSearchLine, RiUserUnfollowLine } from 'react-icons/ri';
import { AccountEditOutline } from 'mdi-material-ui';
import Link from 'next/link';

import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import RenderAvatar from '@/@core/components/avatar';
import TableHeader from '@/views/apps/student/list/TableHeader';
import { useStudentList } from '@/hooks/features/student';
import type { StudentImportResult } from '@/hooks/queries/useStudents';

// ─── Styled Components ────────────────────────────────────────────────────────

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  '& .MuiDataGrid-row': {
    maxHeight: 'none !important',
    transition: 'background-color 180ms ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700,
    color: theme.palette.text.primary,
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
  '& .MuiDataGrid-footerContainer': {
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
  },
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

const StudentNameCell = memo(({ row }: { row: any }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
    <RenderAvatar row={row.user?.account} />
    <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', minWidth: 0 }}>
      <Typography
        noWrap
        variant='body2'
        sx={{
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '-0.02em',
          color: 'text.primary',
        }}
      >
        {row.user?.account?.title + '' + row.user?.account?.firstName + ' ' + row.user?.account?.lastName}
      </Typography>
      <Typography
        noWrap
        variant='caption'
        sx={{
          mt: 0.25,
          fontSize: '0.84rem',
          fontWeight: 600,
          letterSpacing: '0.01em',
          color: 'text.secondary',
        }}
      >
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

interface StudentImportResultDialogProps {
  open: boolean;
  result: StudentImportResult | null;
  onClose: () => void;
}

const StudentImportResultDialog = memo(({ open, result, onClose }: StudentImportResultDialogProps) => {
  if (!result) return null;

  const hasImportedRows = result.imported > 0;
  const isPartialImport = result.failed > 0;
  const isEmptyImport = result.total === 0 || !hasImportedRows;
  const alertSeverity = isEmptyImport ? 'warning' : isPartialImport ? 'warning' : 'success';
  const alertTitle = isEmptyImport
    ? 'ไม่พบข้อมูลสำหรับนำเข้า'
    : isPartialImport
      ? 'นำเข้าเสร็จบางส่วน'
      : 'นำเข้าสำเร็จ';
  const processedLabel = result.updated && result.updated > 0 ? 'สำเร็จ' : 'นำเข้าได้';

  return (
    <Dialog open={open} fullWidth maxWidth='sm' aria-labelledby='student-import-result-title' onClose={onClose}>
      <DialogTitle id='student-import-result-title'>ผลการนำเข้าข้อมูลนักเรียน</DialogTitle>
      <DialogContent>
        <Alert severity={alertSeverity} sx={{ mb: 4 }}>
          <AlertTitle>{alertTitle}</AlertTitle>
          {result.message}
        </Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2, mb: 4 }}>
          <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
            <Typography variant='caption' color='text.secondary'>
              ทั้งหมด
            </Typography>
            <Typography variant='h6'>{result.total}</Typography>
          </Box>
          <Box
            sx={{
              p: 3,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: (theme) => `1px solid ${theme.palette.success.light}`,
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              {processedLabel}
            </Typography>
            <Typography variant='h6'>{result.imported}</Typography>
          </Box>
          <Box
            sx={{
              p: 3,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: (theme) =>
                result.failed > 0 ? `1px solid ${theme.palette.error.light}` : `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              ไม่สำเร็จ
            </Typography>
            <Typography variant='h6'>{result.failed}</Typography>
          </Box>
        </Box>

        {result.errors.length > 0 && (
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              รายการที่นำเข้าไม่สำเร็จ
            </Typography>
            <Box
              sx={{
                maxHeight: 280,
                overflowY: 'auto',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <List disablePadding dense>
                {result.errors.map((error) => (
                  <ListItem key={`${error.row}-${error.message}`} divider>
                    <ListItemText primary={`แถว ${error.row}`} secondary={error.message} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button variant='contained' onClick={onClose}>
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

const StudentListPage = () => {
  const {
    classrooms,
    initClassroom,
    currentClassroomId,
    loadingClassroom,
    isAdmin,
    students,
    loadingStudent,
    currentStudent,
    searchValue,
    openDeletedConfirm,
    deletedStudent,
    openImportResultDialog,
    importResult,
    isImportingStudents,
    isDownloadingTemplate,
    isExportingStudents,
    pageSize,
    setPageSize,
    handleChangeClassroom,
    handleChangeFullName,
    handleSearchChange,
    handleStudentId,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleImportStudents,
    handleCloseImportResultDialog,
    handleDownloadTemplate,
    handleExportStudents,
  } = useStudentList();

  const handlePaginationModelChange = useCallback(
    (model: { pageSize: number; page: number }) => setPageSize(model.pageSize),
    [setPageSize],
  );

  const columns: GridColDef[] = useMemo(
    () => [
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
    ],
    [currentClassroomId, handleDeleteClick],
  );

  return (
    <React.Fragment>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              boxShadow: (theme) => `0 18px 42px ${alpha(theme.palette.primary.main, 0.08)}`,
              background: (theme) =>
                `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${theme.palette.background.paper} 16%)`,
            }}
          >
            <CardHeader
              avatar={
                <Avatar
                  sx={{
                    color: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    width: { xs: 42, sm: 48 },
                    height: { xs: 42, sm: 48 },
                  }}
                  aria-label='recipe'
                >
                  <RiContactsBookLine />
                </Avatar>
              }
              sx={{
                color: 'text.primary',
                px: { xs: 3, sm: 4, lg: 5 },
                pt: { xs: 3, sm: 4 },
                pb: { xs: 2, sm: 2.5 },
              }}
              title={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    flexWrap: 'wrap',
                    gap: { xs: 0.75, sm: 1.5 },
                  }}
                >
                  <Typography
                    component='span'
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.45rem', sm: '1.9rem' },
                      letterSpacing: { xs: '-0.02em', sm: '-0.03em' },
                      lineHeight: 1.08,
                      color: 'text.primary',
                    }}
                  >
                    รายชื่อนักเรียนทั้งหมด
                  </Typography>
                  <Box
                    component='span'
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: 0.75,
                      px: 1.4,
                      py: 0.6,
                      borderRadius: 999,
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08),
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12)}`,
                      color: 'primary.main',
                      lineHeight: 1,
                    }}
                  >
                    <Typography
                      component='span'
                      sx={{
                        fontSize: { xs: '1.05rem', sm: '1.15rem' },
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {(students?.length ?? 0).toLocaleString('th-TH')}
                    </Typography>
                    <Typography
                      component='span'
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                        color: 'text.secondary',
                      }}
                    >
                      คน
                    </Typography>
                  </Box>
                </Box>
              }
              subheader='ค้นหา จัดการ และนำเข้าข้อมูลนักเรียนได้จากแผงเดียว'
              subheaderTypographyProps={{
                sx: {
                  mt: 1.1,
                  fontSize: 'clamp(0.98rem, 0.94rem + 0.16vw, 1.06rem)',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'text.secondary',
                },
              }}
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
              onImportStudents={handleImportStudents}
              onDownloadTemplate={handleDownloadTemplate}
              onExportStudents={handleExportStudents}
              studentId={searchValue.studentId}
              students={students}
              canImportStudents={isAdmin}
              isImportingStudents={isImportingStudents}
              isDownloadingTemplate={isDownloadingTemplate}
              isExportingStudents={isExportingStudents}
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
      <StudentImportResultDialog
        open={openImportResultDialog}
        result={importResult}
        onClose={handleCloseImportResultDialog}
      />
    </React.Fragment>
  );
};

StudentListPage.acl = {
  action: 'read',
  subject: 'student-list-pages',
};

export default StudentListPage;
