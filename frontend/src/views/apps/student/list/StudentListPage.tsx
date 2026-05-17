'use client';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { alpha, styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import React, { memo, useMemo, useCallback } from 'react';
import { RiContactsBookLine, RiUserSearchLine, RiUserUnfollowLine, RiGraduationCapLine, RiArrowUpLine } from 'react-icons/ri';
import { AccountEditOutline } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import RenderAvatar from '@/@core/components/avatar';
import TableHeader from '@/views/apps/student/list/TableHeader';
import ClassroomPromotionDialog from '@/views/apps/settings/classroom/ClassroomPromotionDialog';
import StudentDeleteDialog from '@/components/dialogs/StudentDeleteDialog';
import StudentBulkDeleteDialog from '@/components/dialogs/StudentBulkDeleteDialog';
import StudentGraduationDialog from '@/components/dialogs/StudentGraduationDialog';
import StudentBulkGraduationDialog from '@/components/dialogs/StudentBulkGraduationDialog';
import StudentIndividualPromotionDialog from '@/components/dialogs/StudentIndividualPromotionDialog';
import { useStudentList } from '@/hooks/features/student';
import type { StudentImportResult } from '@/hooks/queries/useStudents';

// ─── Styled Components ────────────────────────────────────────────────────────

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
    paddingRight: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingRight: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingRight: theme.spacing(5) },
  },
  '& .MuiDataGrid-columnHeader[data-field="fullName"]': {
    paddingLeft: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(5) },
  },
  '& .MuiDataGrid-columnHeader[data-field="actions"]': {
    paddingRight: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingRight: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingRight: theme.spacing(5) },
  },
  '& .MuiDataGrid-cell[data-field="fullName"]': {
    paddingLeft: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(5) },
  },
  '& .MuiDataGrid-cell[data-field="actions"]': {
    paddingRight: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingRight: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingRight: theme.spacing(5) },
  },
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

const StudentNameCell = memo(({ row }: { row: any }) => {
  const isGrad =
    row.isGraduation === true || row.studentStatus === 'graduated' || row.studentStatus === 'จบการศึกษา';
  const isDropped = row.studentStatus === 'ออกก่อนกำหนด';

  return (
    <Stack direction='row' sx={{ alignItems: 'center', gap: 1.75 }}>
      <RenderAvatar row={row.user?.account} />
      <Stack sx={{ minWidth: 0 }}>
        <Typography
          noWrap
          variant='body2'
          sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'text.primary' }}
        >
          {`${row.user?.account?.title ?? ''}${row.user?.account?.firstName ?? ''} ${row.user?.account?.lastName ?? ''}`.trim()}
        </Typography>
        <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          <Typography
            noWrap
            variant='caption'
            sx={{ fontSize: '0.84rem', fontWeight: 600, letterSpacing: '0.01em', color: 'text.secondary' }}
          >
            @{row.user?.username}
          </Typography>
          {(isGrad || isDropped) && (
            <Chip
              label={isGrad ? 'จบการศึกษา' : 'ออกก่อนกำหนด'}
              size='small'
              color={isGrad ? 'warning' : 'error'}
              variant='outlined'
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
});

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
    <Dialog id='student-import-result-dialog' open={open} fullWidth maxWidth='sm' aria-labelledby='student-import-result-title' onClose={onClose}>
      <DialogTitle id='student-import-result-title'>ผลการนำเข้าข้อมูลนักเรียน</DialogTitle>
      <DialogContent>
        <Alert severity={alertSeverity} sx={{ mb: 4 }}>
          <AlertTitle>{alertTitle}</AlertTitle>
          {result.message}
        </Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2, mb: 4 }}>
          <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
            <Typography variant='caption' sx={{
              color: 'text.secondary'
            }}>
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
            <Typography variant='caption' sx={{
              color: 'text.secondary'
            }}>
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
            <Typography variant='caption' sx={{
              color: 'text.secondary'
            }}>
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
    isDeleting,
    openBulkDeleteConfirm,
    isDeletingAll,
    openGraduationConfirm,
    graduationStudent,
    isGraduating,
    openBulkGraduationConfirm,
    isGraduatingClassroom,
    openPromoteConfirm,
    promoteSource,
    promoteTarget,
    promotePreview,
    isLoadingPromotePreview,
    isPromoting,
    openIndividualPromoteConfirm,
    promoteStudent,
    promoteStudentTarget,
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
    handleStatusChange,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleBulkDeleteClick,
    handleBulkDeleteConfirm,
    handleBulkDeleteCancel,
    handleGraduationClick,
    handleGraduationConfirm,
    handleGraduationCancel,
    handleBulkGraduationClick,
    handleBulkGraduationConfirm,
    handleBulkGraduationCancel,
    handlePromoteClick,
    handlePromoteSourceChange,
    handlePromoteTargetChange,
    handlePromoteConfirm,
    handlePromoteCancel,
    handleIndividualPromoteClick,
    handleIndividualPromoteTargetChange,
    handleIndividualPromoteConfirm,
    handleIndividualPromoteCancel,
    handleImportStudents,
    handleCloseImportResultDialog,
    handleDownloadTemplate,
    handleExportStudents,
  } = useStudentList();

  const handlePaginationModelChange = useCallback(
    (model: { pageSize: number; page: number }) => setPageSize(model.pageSize),
    [setPageSize],
  );

  const activeStudentCount = useMemo(
    () =>
      students.filter(
        (s: any) =>
          !s.isGraduation &&
          s.studentStatus !== 'graduated' &&
          s.studentStatus !== 'จบการศึกษา' &&
          s.studentStatus !== 'ออกก่อนกำหนด',
      ).length,
    [students],
  );
  const graduatedCount = useMemo(
    () =>
      students.filter(
        (s: any) => s.isGraduation === true || s.studentStatus === 'graduated' || s.studentStatus === 'จบการศึกษา',
      ).length,
    [students],
  );
  const droppedCount = useMemo(
    () => students.filter((s: any) => s.studentStatus === 'ออกก่อนกำหนด').length,
    [students],
  );

  type StudentSummaryColor = 'success' | 'warning' | 'error';
  const studentSummaryItems = useMemo(() => {
    const items: { label: string; value: number; color: StudentSummaryColor }[] = [
      { label: 'กำลังศึกษา', value: activeStudentCount, color: 'success' },
      { label: 'จบการศึกษา', value: graduatedCount, color: 'warning' },
    ];
    if (droppedCount > 0) items.push({ label: 'ออกก่อนกำหนด', value: droppedCount, color: 'error' });
    return items;
  }, [activeStudentCount, graduatedCount, droppedCount]);

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
        renderCell: ({ row }) =>
          row.classroom?.name ? (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.25,
                py: 0.35,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                maxWidth: '100%',
              }}
            >
              <Typography noWrap variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {row.classroom.name}
              </Typography>
            </Box>
          ) : (
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              —
            </Typography>
          ),
      },
      {
        flex: 0.24,
        minWidth: 220,
        field: 'actions',
        headerName: 'การดำเนินการ',
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => {
          const isGraduated = row.studentStatus === 'graduated' || row.isGraduation === true;

          const getActionIconSx = (color: 'info' | 'warning' | 'error' | 'success' | 'primary') => ({
            width: 32,
            height: 32,
            borderRadius: 1.5,
            border: (theme: Theme) => `1px solid ${alpha(theme.palette[color].main, 0.24)}`,
            backgroundColor: (theme: Theme) => alpha(theme.palette[color].main, 0.12),
            color: `${color}.dark`,
            transition: 'all 160ms ease',
            '&:hover': {
              backgroundColor: (theme: Theme) => alpha(theme.palette[color].main, 0.2),
            },
            '&.Mui-disabled': {
              borderColor: (theme: Theme) => alpha(theme.palette.action.disabled, 0.28),
              backgroundColor: (theme: Theme) => alpha(theme.palette.action.disabledBackground, 0.46),
              color: 'text.disabled',
            },
          });

          return (
            <Stack
              id={`student-actions-${row?.id}`}
              direction='row'
              sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75, width: '100%' }}
            >
              <Tooltip title='ดูรายละเอียด'>
                <IconButton
                  id={`view-student-${row?.id}`}
                  href={`/apps/student/view/${row?.id}`}
                  sx={getActionIconSx('info')}
                >
                  <RiUserSearchLine fontSize='1rem' />
                </IconButton>
              </Tooltip>
              <Tooltip title='แก้ไข'>
                <IconButton
                  id={`edit-student-${row?.id}`}
                  href={`/apps/student/edit/${row?.id}?classroom=${currentClassroomId}`}
                  sx={getActionIconSx('warning')}
                >
                  <AccountEditOutline fontSize='small' />
                </IconButton>
              </Tooltip>
              <Tooltip title='เลื่อนชั้น'>
                <IconButton
                  id={`promote-student-${row?.id}`}
                  disabled={isGraduated}
                  sx={getActionIconSx('primary')}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIndividualPromoteClick(row);
                  }}
                >
                  <RiArrowUpLine fontSize='1rem' />
                </IconButton>
              </Tooltip>
              <Tooltip title={isGraduated ? 'จบแล้ว' : 'จบการศึกษา'}>
                <IconButton
                  id={`graduate-student-${row?.id}`}
                  disabled={isGraduated}
                  sx={getActionIconSx('success')}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGraduationClick(row);
                  }}
                >
                  <RiGraduationCapLine fontSize='1rem' />
                </IconButton>
              </Tooltip>
              <Tooltip title='ลบข้อมูล'>
                <IconButton
                  id={`delete-student-${row?.id}`}
                  sx={getActionIconSx('error')}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(row);
                  }}
                >
                  <RiUserUnfollowLine fontSize='1rem' />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [currentClassroomId, handleDeleteClick, handleGraduationClick, handleIndividualPromoteClick],
  );

  return (
    <React.Fragment>
      <Grid id='student-list-container' container spacing={6}>
        <Grid size={12}>
          <Card
            id='student-list-card'
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: (theme) =>
                `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.08)}`,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? `0 18px 42px ${alpha(theme.palette.common.black, 0.24)}`
                  : `0 18px 42px ${alpha(theme.palette.primary.main, 0.08)}`,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 32%)`
                  : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.paper} 32%)`,
            }}
          >
            <CardHeader
              id='student-list-card-header'
              avatar={
                <Avatar
                  sx={{
                    color: (theme) => theme.palette.primary.dark,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
                    width: { xs: 42, sm: 48 },
                    height: { xs: 42, sm: 48 },
                    boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.primary.main, 0.16)}`,
                  }}
                  aria-label='student-list'
                >
                  <RiContactsBookLine />
                </Avatar>
              }
              sx={{
                color: 'text.primary',
                alignItems: 'flex-start',
                px: { xs: 3, sm: 4, lg: 5 },
                pt: { xs: 3, sm: 4.25 },
                pb: { xs: 2.5, sm: 3 },
                '& .MuiCardHeader-avatar': {
                  mt: 0.25,
                  mr: { xs: 2, sm: 2.5 },
                },
                '& .MuiCardHeader-content': {
                  minWidth: 0,
                },
              }}
              title={
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexWrap: 'wrap',
                    columnGap: { xs: 1, sm: 1.5 },
                    rowGap: 0.75,
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
                  {students.length > 0 && (
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
                        {students.length.toLocaleString('th-TH')}
                      </Typography>
                      <Typography
                        component='span'
                        sx={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.01em', color: 'text.secondary' }}
                      >
                        คน
                      </Typography>
                    </Box>
                  )}
                </Stack>
              }
              subheader={
                <Box>
                  <Typography
                    component='p'
                    sx={{
                      mt: 1.1,
                      fontSize: 'clamp(0.98rem, 0.94rem + 0.16vw, 1.06rem)',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: 'text.secondary',
                    }}
                  >
                    ค้นหา จัดการ และนำเข้าข้อมูลนักเรียนได้จากแผงเดียว
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: { xs: 0.75, sm: 1 },
                      mt: 2.25,
                      maxWidth: 760,
                    }}
                  >
                    {studentSummaryItems.map((item) => (
                      <Box
                        key={item.label}
                        component='span'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          px: 1.35,
                          py: 0.7,
                          minHeight: 30,
                          borderRadius: 999,
                          border: (theme) =>
                            `1px solid ${alpha(theme.palette[item.color].main, theme.palette.mode === 'dark' ? 0.26 : 0.18)}`,
                          bgcolor: (theme) =>
                            alpha(theme.palette[item.color].main, theme.palette.mode === 'dark' ? 0.11 : 0.075),
                        }}
                      >
                        <Typography
                          component='span'
                          sx={{
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            lineHeight: 1,
                            color: `${item.color}.dark`,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {item.value.toLocaleString('th-TH')}
                        </Typography>
                        <Typography
                          component='span'
                          sx={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1, color: 'text.secondary' }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              }
              slotProps={{
                subheader: {
                  component: 'div',
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
              onBulkGraduate={isAdmin ? handleBulkGraduationClick : undefined}
              onBulkPromote={isAdmin ? handlePromoteClick : undefined}
              onDeleteAll={isAdmin ? handleBulkDeleteClick : undefined}
              onStatusChange={handleStatusChange}
              studentStatus={searchValue.studentStatus}
              studentId={searchValue.studentId}
              students={students}
              canImportStudents={isAdmin}
              isImportingStudents={isImportingStudents}
              isDownloadingTemplate={isDownloadingTemplate}
              isExportingStudents={isExportingStudents}
              isPromoting={isPromoting}
              isDeleting={isDeletingAll}
            />
            <Box id='student-list-data-grid'>
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
            </Box>
          </Card>
        </Grid>
      </Grid>
      {openDeletedConfirm && (
        <StudentDeleteDialog
          open={openDeletedConfirm}
          student={deletedStudent}
          isDeleting={isDeleting}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {openBulkDeleteConfirm && (
        <StudentBulkDeleteDialog
          open={openBulkDeleteConfirm}
          classroomName={initClassroom?.name ?? ''}
          studentCount={students.length}
          isDeleting={isDeletingAll}
          onClose={handleBulkDeleteCancel}
          onConfirm={handleBulkDeleteConfirm}
        />
      )}
      {openGraduationConfirm && (
        <StudentGraduationDialog
          open={openGraduationConfirm}
          student={graduationStudent}
          isGraduating={isGraduating}
          onClose={handleGraduationCancel}
          onConfirm={handleGraduationConfirm}
        />
      )}
      {openBulkGraduationConfirm && (
        <StudentBulkGraduationDialog
          open={openBulkGraduationConfirm}
          classroomName={initClassroom?.name ?? ''}
          studentCount={students.length}
          isGraduating={isGraduatingClassroom}
          onClose={handleBulkGraduationCancel}
          onConfirm={handleBulkGraduationConfirm}
        />
      )}
      {openPromoteConfirm && (
        <ClassroomPromotionDialog
          open={openPromoteConfirm}
          classrooms={classrooms}
          promoteSource={promoteSource}
          promoteTarget={promoteTarget}
          promotePreview={promotePreview}
          isLoadingPreview={isLoadingPromotePreview}
          isPromoting={isPromoting}
          onSourceChange={handlePromoteSourceChange}
          onTargetChange={handlePromoteTargetChange}
          onConfirm={handlePromoteConfirm}
          onCancel={handlePromoteCancel}
        />
      )}
      {openIndividualPromoteConfirm && (
        <StudentIndividualPromotionDialog
          open={openIndividualPromoteConfirm}
          student={promoteStudent}
          classrooms={classrooms}
          targetClassroom={promoteStudentTarget}
          isPromoting={isPromoting}
          onTargetChange={handleIndividualPromoteTargetChange}
          onConfirm={handleIndividualPromoteConfirm}
          onCancel={handleIndividualPromoteCancel}
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
