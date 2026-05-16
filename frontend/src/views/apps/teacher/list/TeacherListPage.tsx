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
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HumanMaleBoard } from 'mdi-material-ui';
import Grid from '@mui/material/Grid';
import React, { Fragment, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useResponsive } from '@/@core/hooks/useResponsive';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';

import AddTeacherDrawer from '@/views/apps/teacher/list/AddUserDrawer';
import DialogEditUserInfo from '@/views/apps/admin/teacher/DialogEditUserInfo';
import ResetPasswordDialog from '@/views/apps/admin/teacher/ResetPasswordDialog';
import SidebarAddClassroom from '@/views/apps/teacher/list/AddClassroomDrawer';
import TableHeader from '@/views/apps/teacher/list/TableHeader';
import DialogDeleteTeacher from '@/views/apps/admin/teacher/DialogDeleteTeacher';
import TeacherMobileCard from '@/views/apps/teacher/list/components/TeacherMobileCard';
import InfiniteScrollTrigger from '@/views/apps/teacher/list/components/InfiniteScrollTrigger';

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
    currentTeacher,
    teachers,
    isSubmittingClassroom,
    isLoadingTeachers,
    displayedTeachers,
    isLoadingMore,
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
    onHandleEditClose,
    onHandleChangePasswordClose,
    handleDeleteClose,
    handleEditTeacher,
    handleChangePasswordTeacher,
    onHandleAddTeacher,
    handleDeleteConfirm,
    handleAddClassroom,
    handleLoadMore,
    refreshTeachers,
  } = useTeacherList();
  const { mutate: importTeachers, isPending: isImporting } = useImportTeachers();

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
      <Grid container spacing={isMobile ? 3 : 6} id='teacher-list-container'>
        <Grid size={12}>
          <Card id='teacher-list-card'>
            <CardHeader
              avatar={
                <Avatar
                  sx={{
                    color: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    width: { xs: 42, sm: 48 },
                    height: { xs: 42, sm: 48 },
                  }}
                >
                  <HumanMaleBoard />
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
                    ครู / บุคลากร
                  </Typography>
                  {teachers.length > 0 && (
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
                        {teachers.length.toLocaleString('th-TH')}
                      </Typography>
                      <Typography
                        component='span'
                        sx={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.01em', color: 'text.secondary' }}
                      >
                        คน
                      </Typography>
                    </Box>
                  )}
                </Box>
              }
              subheader='ค้นหา จัดการ และนำเข้าข้อมูลครู/บุคลากรได้จากแผงเดียว'
              slotProps={{
                subheader: {
                  sx: {
                    mt: 1.1,
                    fontSize: 'clamp(0.98rem, 0.94rem + 0.16vw, 1.06rem)',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: 'text.secondary',
                  },
                },
              }}
            />
            <TableHeader
              value={searchValue}
              handleFilter={handleFilter}
              toggle={toggleAddUserDrawer}
              onDownloadTemplate={handleDownloadTemplate}
              onExport={handleExport}
              onImportClick={handleImportClick}
              isDownloadingTemplate={isDownloadingTemplate}
              isExporting={isExporting}
              isImporting={isImporting}
              canExport={teachers.length > 0}
            />
            {isMobile ? (
              <Box id='teacher-mobile-list-container' sx={{ px: 2, pb: 2 }}>
                {isLoadingTeachers ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      กำลังโหลด...
                    </Typography>
                  </Box>
                ) : displayedTeachers.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
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
              <Box id='teacher-data-grid-container'>
                <DataGrid
                  disableColumnMenu
                  rows={teachers}
                  loading={isLoadingTeachers}
                  getRowHeight={() => 'auto'}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize, page: 0 },
                    },
                  }}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPaginationModelChange={(model) => setPageSize(model.pageSize)}
                  disableRowSelectionOnClick
                  localeText={{
                    noRowsLabel: 'ไม่มีข้อมูล',
                  }}
                  slotProps={{
                    pagination: {
                      labelRowsPerPage: 'แถวต่อหน้า',
                      labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
                        `${from}–${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`,
                    },
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
                      fontSize: isTablet ? '0.8rem' : '0.875rem',
                      padding: isTablet ? '8px' : '16px',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: isTablet ? '0.8rem' : '0.875rem',
                      padding: isTablet ? '8px' : '16px',
                    },
                    '& .MuiDataGrid-renderingZone': {
                      maxHeight: 'none !important',
                    },
                  }}
                />
              </Box>
            )}
          </Card>
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
      <Dialog open={isImportResultOpen} fullWidth maxWidth='sm' onClose={() => setIsImportResultOpen(false)}>
        <DialogTitle>ผลการนำเข้าข้อมูลครูและบุคลากร</DialogTitle>
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
                  { label: 'ทั้งหมด', value: importResult.total, color: 'text.primary' },
                  { label: 'สำเร็จ', value: importResult.imported, color: 'success.main' },
                  { label: 'อัปเดต', value: importResult.updated, color: 'info.main' },
                  { label: 'ไม่สำเร็จ', value: importResult.failed, color: importResult.failed > 0 ? 'error.main' : 'text.secondary' },
                ].map(({ label, value, color }) => (
                  <Box
                    key={label}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant='h5' sx={{ fontWeight: 700, color, lineHeight: 1.2 }}>
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
          <Button variant='contained' onClick={() => setIsImportResultOpen(false)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
      <input ref={fileInputRef} hidden type='file' accept='.xlsx' onChange={handleImportFile} />
    </Fragment>
  );
};

TeacherListPage.acl = {
  action: 'read',
  subject: 'teacher-list-pages',
};

export default TeacherListPage;
