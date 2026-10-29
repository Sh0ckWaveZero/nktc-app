'use client';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { GridColDef } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import AppListDataGrid from '@/@core/components/data-grid/AppListDataGrid';
import { AppListCard, AppListCardHeader, type ListSummaryItem } from '@/@core/components/list-page';
import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  RiContactsBookLine,
  RiUserSearchLine,
  RiUserUnfollowLine,
  RiGraduationCapLine,
  RiArrowUpLine,
} from 'react-icons/ri';
import { AccountEditOutline } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import RenderAvatar from '@/@core/components/avatar';
import Icon from '@/@core/components/icon';
import TableHeader from '@/views/apps/student/list/TableHeader';
import ClassroomPromotionDialog from '@/views/apps/settings/classroom/ClassroomPromotionDialog';
import StudentDeleteDialog from '@/components/dialogs/StudentDeleteDialog';
import StudentBulkDeleteDialog from '@/components/dialogs/StudentBulkDeleteDialog';
import StudentGraduationDialog from '@/components/dialogs/StudentGraduationDialog';
import StudentBulkGraduationDialog from '@/components/dialogs/StudentBulkGraduationDialog';
import StudentIndividualPromotionDialog from '@/components/dialogs/StudentIndividualPromotionDialog';
import { useStudentList } from '@/hooks/features/student';
import { useResetMfaForAdmin, useResetPasskeyForAdmin } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { studentKeys } from '@/libs/react-query/queryKeys';
import { toast } from 'react-toastify';
import ConfirmResetDialog from '@/views/apps/user/view/ConfirmResetDialog';
import type { StudentImportResult } from '@/hooks/queries/useStudents';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StudentNameCell = memo(({ row }: { row: any }) => {
  const isGrad = row.isGraduation === true || row.studentStatus === 'graduated' || row.studentStatus === 'จบการศึกษา';
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
    <Dialog
      id='student-import-result-dialog'
      open={open}
      fullWidth
      maxWidth='sm'
      aria-labelledby='student-import-result-title'
      onClose={onClose}
    >
      <DialogTitle id='student-import-result-title'>ผลการนำเข้าข้อมูลนักเรียน</DialogTitle>
      <DialogContent>
        <Alert severity={alertSeverity} sx={{ mb: 4 }}>
          <AlertTitle>{alertTitle}</AlertTitle>
          {result.message}
        </Alert>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2, mb: 4 }}>
          <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
              }}
            >
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
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
              }}
            >
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
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
              }}
            >
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

  const queryClient = useQueryClient();
  const resetMfaMutation = useResetMfaForAdmin();
  const resetPasskeyMutation = useResetPasskeyForAdmin();
  const [resetTarget, setResetTarget] = useState<{ student: any; type: 'mfa' | 'passkey' } | null>(null);

  const handleResetMfa = useCallback((student: any) => setResetTarget({ student, type: 'mfa' }), []);
  const handleResetPasskey = useCallback((student: any) => setResetTarget({ student, type: 'passkey' }), []);

  const handleConfirmSecurityReset = async () => {
    if (!resetTarget) return;
    const { student, type } = resetTarget;
    const mutation = type === 'mfa' ? resetMfaMutation : resetPasskeyMutation;
    try {
      await mutation.mutateAsync(student.id);
      toast.success(type === 'mfa' ? 'รีเซ็ต MFA สำเร็จ ผู้ใช้จะต้องเข้าสู่ระบบใหม่' : 'รีเซ็ต Passkey สำเร็จ ผู้ใช้จะต้องเข้าสู่ระบบใหม่');
      setResetTarget(null);
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    } catch (error: any) {
      toast.error(error?.message || 'เกิดข้อผิดพลาดในการรีเซ็ต');
    }
  };

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

  const studentSummaryItems = useMemo<ListSummaryItem[]>(() => {
    const items: ListSummaryItem[] = [
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
              {isAdmin && (
                <Tooltip title={row?.user?.authUser?.twoFactorEnabled ? 'รีเซ็ต MFA' : 'ผู้ใช้ยังไม่ได้เปิด MFA'}>
                  <span style={{ display: 'inline-flex' }}>
                    <IconButton
                      id={`student-reset-mfa-${row?.id}`}
                      disabled={row?.user?.authUser?.twoFactorEnabled !== true}
                      sx={getActionIconSx('error')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetMfa(row);
                      }}
                    >
                      <Icon icon='mdi:two-factor-authentication' fontSize='1rem' />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {isAdmin && (
                <Tooltip title={(row?.user?.authUser?._count?.passkeys ?? 0) > 0 ? 'รีเซ็ต Passkey' : 'ผู้ใช้ยังไม่มี Passkey'}>
                  <span style={{ display: 'inline-flex' }}>
                    <IconButton
                      id={`student-reset-passkey-${row?.id}`}
                      disabled={(row?.user?.authUser?._count?.passkeys ?? 0) === 0}
                      sx={getActionIconSx('error')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetPasskey(row);
                      }}
                    >
                      <Icon icon='mdi:fingerprint' fontSize='1rem' />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
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
    [currentClassroomId, handleDeleteClick, handleGraduationClick, handleIndividualPromoteClick, handleResetMfa, handleResetPasskey, isAdmin],
  );

  return (
    <React.Fragment>
      <Grid id='student-list-container' container spacing={6}>
        <Grid size={12}>
          <AppListCard id='student-list-card'>
            <AppListCardHeader
              id='student-list-card-header'
              icon={<RiContactsBookLine />}
              title='รายชื่อนักเรียนทั้งหมด'
              count={students.length}
              countUnit='คน'
              description='ค้นหา จัดการ และนำเข้าข้อมูลนักเรียนได้จากแผงเดียว'
              summaryItems={studentSummaryItems}
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
              <AppListDataGrid
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
          </AppListCard>
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
      <ConfirmResetDialog
        dialogId='student-reset-mfa'
        open={resetTarget?.type === 'mfa'}
        title={`รีเซ็ต MFA ของ ${resetTarget?.student ? `${resetTarget.student.user?.account?.firstName || ''} ${resetTarget.student.user?.account?.lastName || ''}`.trim() : ''}`}
        description='การรีเซ็ตจะลบรหัส TOTP และรหัสสำรองทั้งหมดของนักเรียนรายนี้ นักเรียนจะต้องตั้งค่า MFA ใหม่อีกครั้ง'
        warning='นักเรียนจะถูกออกจากระบบทันทีและต้องเข้าสู่ระบบใหม่'
        confirmText='ยืนยันรีเซ็ต MFA'
        loading={resetMfaMutation.isPending}
        onConfirm={handleConfirmSecurityReset}
        onClose={() => setResetTarget(null)}
      />
      <ConfirmResetDialog
        dialogId='student-reset-passkey'
        open={resetTarget?.type === 'passkey'}
        title={`รีเซ็ต Passkey ของ ${resetTarget?.student ? `${resetTarget.student.user?.account?.firstName || ''} ${resetTarget.student.user?.account?.lastName || ''}`.trim() : ''}`}
        description='การรีเซ็ตจะลบ passkey ทั้งหมดของนักเรียนรายนี้ นักเรียนจะต้องลงทะเบียน passkey ใหม่อีกครั้ง'
        warning='นักเรียนจะถูกออกจากระบบทันทีและต้องเข้าสู่ระบบใหม่'
        confirmText='ยืนยันรีเซ็ต Passkey'
        loading={resetPasskeyMutation.isPending}
        onConfirm={handleConfirmSecurityReset}
        onClose={() => setResetTarget(null)}
      />
    </React.Fragment>
  );
};

StudentListPage.acl = {
  action: 'read',
  subject: 'student-list-pages',
};

export default StudentListPage;
