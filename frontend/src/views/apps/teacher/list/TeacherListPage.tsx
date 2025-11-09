'use client';

import { Box, Card, CardHeader, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { Fragment, useMemo } from 'react';
import { useResponsive } from '@/@core/hooks/useResponsive';
import { DataGrid } from '@mui/x-data-grid';

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
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/views/apps/teacher/list/constants';

const TeacherListPage = () => {
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();

  const {
    // State
    searchValue,
    pageSize,
    addUserOpen,
    addClassroomOpen,
    currentData,
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
  } = useTeacherList();

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
    [handleEdit, handleDelete, handleChangePassword, handleAddClassroom, isMobile, theme]
  );

  return (
    <Fragment>
      <Grid container spacing={isMobile ? 3 : 6} id='teacher-list-container'>
        <Grid size={12}>
          <Card id='teacher-list-card'>
            <CardHeader 
              title='ข้อมูลครู / บุคลากร ทั้งหมด'
              sx={{
                '& .MuiCardHeader-title': {
                  fontSize: isMobile ? '1.1rem' : '1.25rem',
                },
              }}
            />
            <TableHeader
              value={searchValue}
              handleFilter={handleFilter}
              toggle={toggleAddUserDrawer}
              data={teachers}
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
                      <InfiniteScrollTrigger
                        onLoadMore={handleLoadMore}
                        isLoading={isLoadingMore}
                      />
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
    </Fragment>
  );
};

TeacherListPage.acl = {
  action: 'read',
  subject: 'teacher-list-pages',
};

export default TeacherListPage;
