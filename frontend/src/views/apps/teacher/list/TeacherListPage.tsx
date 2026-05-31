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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { HumanMaleBoard } from 'mdi-material-ui';
import React, { Fragment, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useResponsive } from '@/@core/hooks/useResponsive';
import { AppTeacherDataGrid } from '@/@core/components/data-grid/AppListDataGrid';
import { AppListCard, AppListCardHeader, type ListSummaryItem } from '@/@core/components/list-page';
import { toast } from 'react-toastify';

import AddTeacherDrawer from '@/views/apps/teacher/list/AddUserDrawer';
import DialogEditUserInfo from '@/views/apps/admin/teacher/DialogEditUserInfo';
import ResetPasswordDialog from '@/views/apps/admin/teacher/ResetPasswordDialog';
import SidebarAddClassroom from '@/views/apps/teacher/list/AddClassroomDrawer';
import TableHeader from '@/views/apps/teacher/list/TableHeader';
import DialogDeleteTeacher from '@/views/apps/admin/teacher/DialogDeleteTeacher';
import TeacherMobileCard from '@/views/apps/teacher/list/components/TeacherMobileCard';
import InfiniteScrollTrigger from '@/views/apps/teacher/list/components/InfiniteScrollTrigger';
import ConfirmDialog, { type ConfirmDialogOptions } from '@/@core/components/dialogs/ConfirmDialog';

import { useTeacherList } from '@/views/apps/teacher/list/hooks/useTeacherList';
import { getColumns } from '@/views/apps/teacher/list/utils/getColumns';
import { PAGE_SIZE_OPTIONS } from '@/views/apps/teacher/list/constants';
import httpClient from '@/@core/utils/http';
import { authConfig } from '@/configs/auth';
import { useImportTeachers, type TeacherImportResult } from '@/hooks/queries';

const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.response?.data?.message === 'string') {
    return error.response.data.message;
  }

  if (typeof error?.message === 'string') {
    return error.message;
  }

  return fallback;
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
        return;
      }

      const [, base64] = result.split(',');
      resolve(base64 || '');
    };

    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });

const formatExportBirthDate = (value?: Date | string | null) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

const TeacherListPage = () => {
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<TeacherImportResult | null>(null);
  const [isImportResultOpen, setIsImportResultOpen] = useState(false);

  const {
    // State
    searchValue,
    pageSize,
    addUserOpen,
    addClassroomOpen,
    openDialogEdit,
    openDialogDelete,
    openChangePassword,
    openResetLoginDays,
    currentTeacher,
    teachers,
    isSubmittingClassroom,
    isLoadingTeachers,
    displayedTeachers,
    isLoadingMore,
    isResettingLoginDays,
    isAdmin,
    defaultValue,

    // Actions
    setPageSize,
    handleFilter,
    toggleAddUserDrawer,
    toggleAddClassroomDrawer,
    onSubmittedClassroom,
    handleEdit,
    handleDelete,
    handleChangePassword,
    handleOpenResetLoginDays,
    onHandleEditClose,
    onHandleChangePasswordClose,
    handleDeleteClose,
    handleResetLoginDaysClose,
    handleEditTeacher,
    handleChangePasswordTeacher,
    onHandleAddTeacher,
    handleDeleteConfirm,
    handleResetLoginDaysConfirm,
    handleAddClassroom,
    handleLoadMore,
    refreshTeachers,
  } = useTeacherList();
  const { mutate: importTeachers, isPending: isImporting } = useImportTeachers();
  const activeTeacherCount = useMemo(
    () => teachers.filter((teacher) => String(teacher.status).toLowerCase() === 'active').length,
    [teachers],
  );
  const classroomAssignedCount = useMemo(
    () => teachers.filter((teacher) => (teacher.teacherOnClassroom || []).length > 0).length,
    [teachers],
  );
  const importToolIsBusy = isDownloadingTemplate || isExporting || isImporting;
  const teacherSummaryItems = useMemo<ListSummaryItem[]>(
    () => [
      { label: 'เปิดใช้งาน', value: activeTeacherCount, color: 'success' },
      { label: 'มีห้องที่ปรึกษา', value: classroomAssignedCount, color: 'primary' },
      {
        label: importToolIsBusy ? 'กำลังประมวลผลไฟล์' : 'พร้อมนำเข้าไฟล์',
        value: importToolIsBusy ? '...' : '.xlsx',
        color: 'warning',
      },
    ],
    [activeTeacherCount, classroomAssignedCount, importToolIsBusy],
  );
  const resetLoginDaysDialogOptions = useMemo<ConfirmDialogOptions>(() => {
    return {
      title: 'ยืนยันการรีเซตวันเข้าใช้งานทั้งหมด',
      message: `ระบบจะล้างประวัติวันเข้าใช้งานของครู / บุคลากรทั้งหมด ${teachers.length} คน และเริ่มนับใหม่ตั้งแต่การล็อกอินครั้งถัดไป`,
      severity: 'warning',
      confirmText: 'รีเซตทั้งหมด',
      cancelText: 'ยกเลิก',
      showWarning: true,
      warningMessage: 'การดำเนินการนี้จะล้างสถิติวันเข้าใช้งานของครูทุกคนพร้อมกัน และไม่สามารถกู้ค่าที่ลบไปแล้วกลับมาได้',
    };
  }, [teachers.length]);

  // ** Memoized Columns
  const columns = useMemo(
    () =>
      getColumns({
        isMobile: !!isMobile,
        handleEdit,
        handleDelete,
        handleChangePassword,
        onAddClassroom: handleAddClassroom,
        theme,
      }),
    [handleEdit, handleDelete, handleChangePassword, handleAddClassroom, isMobile, theme],
  );

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/download-template`, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'teacher_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, 'ไม่สามารถดาวน์โหลด template ได้'));
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleExport = async () => {
    if (teachers.length === 0) {
      toast.warning('ไม่มีข้อมูลครู/บุคลากรสำหรับ export');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        teachers.map((teacher) => ({
          ชื่อผู้ใช้: teacher.user?.username || '',
          รหัสครู: teacher.teacherId || '',
          คำนำหน้า: teacher.user?.account?.title || '',
          ชื่อ: teacher.user?.account?.firstName || '',
          นามสกุล: teacher.user?.account?.lastName || '',
          เลขบัตรประชาชน: teacher.user?.account?.idCard || '',
          วันเกิด: formatExportBirthDate(teacher.user?.account?.birthDate),
          อีเมล: teacher.user?.email || '',
          เบอร์โทร: teacher.user?.account?.phone || '',
          ตำแหน่ง: teacher.jobTitle || '',
          วิทยฐานะ: teacher.academicStanding || '',
          สถานะ: teacher.status === 'inactive' ? 'ปิดใช้งาน' : 'เปิดใช้งาน',
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ครูและบุคลากร');
      XLSX.writeFile(workbook, `teachers_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'ไม่สามารถ export ข้อมูลครู/บุคลากรได้'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('รองรับเฉพาะไฟล์ .xlsx');
      return;
    }

    try {
      const file = await fileToBase64(selectedFile);

      importTeachers(
        { file },
        {
          onSuccess: (result) => {
            setImportResult(result);
            setIsImportResultOpen(true);
            refreshTeachers();

            if (result.failed > 0 || result.imported === 0) {
              toast.warning(result.message);
              return;
            }

            toast.success(result.message);
          },
          onError: (error) => {
            const _error: any = error;
            toast.error(getErrorMessage(_error, 'ไม่สามารถนำเข้าข้อมูลครู/บุคลากรได้'));
          },
        },
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'ไม่สามารถอ่านไฟล์นำเข้าได้'));
    }
  };

  return (
    <Fragment>
      <Grid container spacing={{ xs: 3, md: 5 }} id='teacher-list-container'>
        <Grid size={12}>
          <AppListCard id='teacher-list-card'>
            <AppListCardHeader
              id='teacher-list-card-header'
              icon={<HumanMaleBoard />}
              title='ครู / บุคลากร'
              count={teachers.length}
              countUnit='คน'
              description='ค้นหา จัดการ และนำเข้าข้อมูลครู/บุคลากรได้จากแผงเดียว'
              summaryItems={teacherSummaryItems}
            />
            <TableHeader
              value={searchValue}
              handleFilter={handleFilter}
              toggle={toggleAddUserDrawer}
              onDownloadTemplate={handleDownloadTemplate}
              onResetLoginDays={handleOpenResetLoginDays}
              onExport={handleExport}
              onImportClick={handleImportClick}
              isDownloadingTemplate={isDownloadingTemplate}
              isResettingLoginDays={isResettingLoginDays}
              isExporting={isExporting}
              isImporting={isImporting}
              canExport={teachers.length > 0}
              showResetLoginDays={isAdmin}
              canResetLoginDays={isAdmin && teachers.length > 0}
            />
            {isMobile ? (
              <Box
                id='teacher-mobile-list-container'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 2, sm: 3 },
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.04 : 0.025),
                }}
              >
                {isLoadingTeachers ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 6,
                      borderRadius: 3,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                    }}
                  >
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      กำลังโหลด...
                    </Typography>
                  </Box>
                ) : displayedTeachers.length === 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      p: 6,
                      borderRadius: 3,
                      border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      bgcolor: (theme) => alpha(theme.palette.warning.main, 0.06),
                    }}
                  >
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      ไม่มีข้อมูล
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {displayedTeachers.map((teacher) => (
                      <TeacherMobileCard
                        key={teacher.id}
                        teacher={teacher}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onChangePassword={handleChangePassword}
                        onAddClassroom={handleAddClassroom}
                      />
                    ))}
                    {/* Infinite scroll trigger */}
                    {displayedTeachers.length < teachers.length && (
                      <InfiniteScrollTrigger onLoadMore={handleLoadMore} isLoading={isLoadingMore} />
                    )}
                  </>
                )}
              </Box>
            ) : (
              <Box id='teacher-data-grid-container' sx={{ '& .MuiDataGrid-root': { minHeight: 440 } }}>
                <AppTeacherDataGrid
                  disableColumnMenu
                  rows={teachers}
                  loading={isLoadingTeachers}
                  getRowHeight={() => 'auto'}
                  columns={columns as any}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize, page: 0 },
                    },
                  }}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPaginationModelChange={(model) => setPageSize(model.pageSize)}
                  disableRowSelectionOnClick
                  localeText={{ noRowsLabel: 'ไม่มีข้อมูล' }}
                  slotProps={{
                    pagination: {
                      labelRowsPerPage: 'แถวต่อหน้า',
                      labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
                        `${from}–${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`,
                    },
                  }}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      fontSize: isTablet ? '0.8rem' : '0.875rem',
                      px: isTablet ? 1.5 : 2.5,
                      py: isTablet ? 1.25 : 2,
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: isTablet ? '0.8rem' : '0.875rem',
                      px: isTablet ? 1.5 : 2.5,
                      py: 1.5,
                    },
                  }}
                />
              </Box>
            )}
          </AppListCard>
        </Grid>
        {addUserOpen && (
          <AddTeacherDrawer
            open={addUserOpen}
            toggle={toggleAddUserDrawer}
            data={teachers}
            onSubmitForm={onHandleAddTeacher}
          />
        )}
        {addClassroomOpen && (
          <SidebarAddClassroom
            open={addClassroomOpen}
            toggle={toggleAddClassroomDrawer}
            onSubmitted={onSubmittedClassroom}
            defaultValues={defaultValue}
            isSubmitting={isSubmittingClassroom}
          />
        )}
      </Grid>
      {openDialogEdit && (
        <Box id='teacher-edit-dialog-container'>
          <DialogEditUserInfo
            show={openDialogEdit}
            data={currentTeacher}
            onClose={onHandleEditClose}
            onSubmitForm={handleEditTeacher}
          />
        </Box>
      )}
      {openChangePassword && (
        <Box id='teacher-change-password-dialog-container'>
          <ResetPasswordDialog
            show={openChangePassword}
            data={currentTeacher}
            onClose={onHandleChangePasswordClose}
            onSubmitForm={handleChangePasswordTeacher}
          />
        </Box>
      )}
      {openDialogDelete && (
        <Box id='teacher-delete-dialog-container'>
          <DialogDeleteTeacher
            data={currentTeacher}
            onClose={handleDeleteClose}
            onSubmitted={handleDeleteConfirm}
            open={openDialogDelete}
          />
        </Box>
      )}
      <ConfirmDialog
        open={openResetLoginDays}
        options={resetLoginDaysDialogOptions}
        onClose={handleResetLoginDaysClose}
        onConfirm={handleResetLoginDaysConfirm}
        isConfirming={isResettingLoginDays}
      />
      <Dialog
        id='teacher-import-result-dialog'
        open={isImportResultOpen}
        fullWidth
        maxWidth='sm'
        aria-labelledby='teacher-import-result-title'
        onClose={() => setIsImportResultOpen(false)}
      >
        <DialogTitle id='teacher-import-result-title'>ผลการนำเข้าข้อมูลครูและบุคลากร</DialogTitle>
        <DialogContent>
          {importResult && (
            <>
              <Alert
                severity={importResult.failed > 0 || importResult.imported === 0 ? 'warning' : 'success'}
                sx={{ mb: 4 }}
              >
                <AlertTitle>
                  {importResult.failed > 0 || importResult.imported === 0 ? 'นำเข้าเสร็จบางส่วน' : 'นำเข้าสำเร็จ'}
                </AlertTitle>
                {importResult.message}
              </Alert>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
                  gap: 2,
                  mb: 4,
                }}
              >
                {[
                  { label: 'ทั้งหมด', value: importResult.total, color: 'primary' },
                  { label: 'สำเร็จ', value: importResult.imported, color: 'success' },
                  { label: 'อัปเดต', value: importResult.updated, color: 'info' },
                  {
                    label: 'ไม่สำเร็จ',
                    value: importResult.failed,
                    color: importResult.failed > 0 ? 'error' : 'secondary',
                  },
                ].map(({ label, value, color }) => (
                  <Box
                    key={label}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette[color as 'primary' | 'success' | 'info' | 'error' | 'secondary'].main, theme.palette.mode === 'dark' ? 0.28 : 0.18)}`,
                      bgcolor: (theme) =>
                        alpha(
                          theme.palette[color as 'primary' | 'success' | 'info' | 'error' | 'secondary'].main,
                          theme.palette.mode === 'dark' ? 0.1 : 0.07,
                        ),
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant='h5' sx={{ fontWeight: 800, color: `${color}.dark`, lineHeight: 1.2 }}>
                      {value}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {importResult.errors.length > 0 && (
                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 2 }}>
                    รายการที่นำเข้าไม่สำเร็จ
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 260,
                      overflowY: 'auto',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                    }}
                  >
                    <List disablePadding dense>
                      {importResult.errors.map((error) => (
                        <ListItem key={`${error.row}-${error.message}`} divider>
                          <ListItemText primary={`แถว ${error.row}`} secondary={error.message} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 5, pt: 1 }}>
          <Button
            id='teacher-import-result-close-button'
            variant='contained'
            onClick={() => setIsImportResultOpen(false)}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
      <input
        id='teacher-import-file-input'
        ref={fileInputRef}
        hidden
        type='file'
        accept='.xlsx'
        onChange={handleImportFile}
      />
    </Fragment>
  );
};

TeacherListPage.acl = {
  action: 'read',
  subject: 'teacher-list-pages',
};

export default TeacherListPage;
