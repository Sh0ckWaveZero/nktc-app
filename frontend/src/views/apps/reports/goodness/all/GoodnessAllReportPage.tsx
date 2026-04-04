'use client';

import { Box, Dialog, Grid, IconButton, styled, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext, useMemo } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CloseIcon from '@mui/icons-material/Close';
import TableHeader from '@/views/apps/reports/goodness/TableHeader';
import { useAuth } from '@/hooks/useAuth';
import TimelineGoodness from '@/views/apps/student/view/TimelineGoodness';
import { useGoodnessReport } from './hooks/useGoodnessReport';
import { useGoodnessReportColumns } from './components/GoodnessReportColumns';
import { GoodnessReportHeader } from './components/GoodnessReportHeader';
import { GoodnessReportDataGrid } from './components/GoodnessReportDataGrid';
import { GoodnessReportMobileView } from './components/GoodnessReportMobileView';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const DialogCloseButton = React.memo(({ onClose }: { onClose: () => void }) => (
  <IconButton
    id='goodness-report-detail-dialog-close-button'
    aria-label='close'
    onClick={onClose}
    sx={(theme) => ({
      position: 'absolute',
      right: 8,
      top: 8,
      color: theme.palette.grey[500],
      zIndex: 1,
    })}
  >
    <CloseIcon />
  </IconButton>
));

DialogCloseButton.displayName = 'DialogCloseButton';

const GoodnessAllReportPage = () => {
  // ** Hooks
  const auth = useAuth();
  const ability = useContext(AbilityContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('lg', 'xl'));

  // Business logic hook
  const {
    control,
    watch,
    classrooms,
    classroomLoading,
    studentsListData,
    loadingStudents,
    currentStudents,
    loadingGoodnessSearch,
    isPending,
    watchedInputValue,
    pageSize,
    mobilePage,
    mobilePageSize,
    open,
    info,
    handleClickOpen,
    handleClose,
    handleSearchChange,
    handleSearchClick,
    handleClearClick,
    getPaginatedStudents,
    getTotalMobilePages,
    handleMobilePageChange,
    handleMobilePageSizeChange,
  } = useGoodnessReport();

  // Columns configuration
  const columns = useGoodnessReportColumns({
    isMobile,
    onDetailClick: handleClickOpen,
  });

  // Memoize responsive values
  const responsiveConfig = useMemo(
    () => ({
      isMobile,
      isTablet,
      cardPadding: isMobile ? 2 : 3,
      containerSpacing: isMobile ? 4 : 6,
    }),
    [isMobile, isTablet],
  );

  // Get selected values for display
  const selectedClassroomName = watch('classroom')?.name || null;
  const selectedDate = watch('goodDate') || null;

  // Get row ID helper
  const getRowId = (row: any) => row.id || row.studentId || `${row.studentId}-${Math.random()}`;

  return (
    ability?.can('read', 'report-goodness-page') &&
    auth?.user?.role !== 'Admin' && (
      <React.Fragment>
        <Box
          id='goodness-report-page'
          sx={{ borderRadius: '8px', overflow: 'hidden' }}
        >
          <Grid id='goodness-report-grid-container' container spacing={responsiveConfig.containerSpacing}>
            <Grid id='goodness-report-grid-item' size={12}>
              <Box
                id='goodness-report-main-container'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                }}
              >
                {/* Header Section */}
                <GoodnessReportHeader
                  selectedClassroomName={selectedClassroomName}
                  selectedDate={selectedDate}
                  totalItems={currentStudents?.length ?? 0}
                />

                {/* Content Section */}
                <Box
                  id='goodness-report-content'
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.paper',
                    position: 'relative',
                  }}
                >
                  {/* Controls Section */}
                  <Box
                    id='goodness-report-controls-section'
                    sx={{
                      flexShrink: 0,
                      px: { xs: 4, sm: 6 },
                      py: 2,
                      borderBottom: 0,
                    }}
                  >
              <TableHeader
                control={control}
                classroomLoading={classroomLoading as boolean}
                classrooms={classrooms}
                datePickLabel='วันที่บันทึกความดี'
                inputValue={watchedInputValue}
                loadingStudents={loadingStudents}
                isPending={isPending}
                      onClear={handleClearClick}
                      onSubmit={handleSearchClick}
                      onSearchChange={handleSearchChange}
                students={studentsListData}
              />
                  </Box>

                  {/* Mobile Card View */}
                  {isMobile ? (
                    <Box id='goodness-report-mobile-view-container'>
                      <GoodnessReportMobileView
                        students={getPaginatedStudents()}
                        currentPage={mobilePage}
                        totalPages={getTotalMobilePages()}
                        pageSize={mobilePageSize}
                        totalItems={currentStudents?.length ?? 0}
                        onDetailClick={handleClickOpen}
                        onPageChange={handleMobilePageChange}
                        onPageSizeChange={handleMobilePageSizeChange}
                      />
                    </Box>
                  ) : (
                    <Box id='goodness-report-desktop-view-container'>
                      <GoodnessReportDataGrid
                        columns={columns}
                        rows={currentStudents}
                        loading={loadingGoodnessSearch}
                        pageSize={pageSize}
                        isTablet={isTablet}
                        getRowId={getRowId}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <BootstrapDialog
          id='goodness-report-detail-dialog'
          fullWidth
          maxWidth='md'
          onClose={handleClose}
          aria-labelledby='goodness-detail-dialog-title'
          open={open}
          disableAutoFocus={false}
          disableEnforceFocus={true}
          disableRestoreFocus={false}
          keepMounted={false}
          sx={{
            '& .MuiDialog-container': {
              '& .MuiPaper-root': {
                maxHeight: '90vh',
              },
            },
            '& .MuiDialogContent-root': {
              maxHeight: 'calc(90vh - 64px)',
              overflowY: 'auto',
            },
          }}
        >
          <Box id='goodness-report-detail-dialog-content'>
            {handleClose && <DialogCloseButton onClose={handleClose} />}
            <TimelineGoodness info={info} user={auth.user} />
          </Box>
        </BootstrapDialog>
      </React.Fragment>
    )
  );
};

export default GoodnessAllReportPage;
