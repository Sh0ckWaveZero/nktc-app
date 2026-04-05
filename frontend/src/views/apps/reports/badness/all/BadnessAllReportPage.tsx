'use client';

import { Box, Dialog, Grid, IconButton, styled, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext, useMemo } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CloseIcon from '@mui/icons-material/Close';
import TableHeader from '@/views/apps/reports/goodness/TableHeader';
import { useAuth } from '@/hooks/useAuth';
import TimelineBadness from '@/views/apps/student/view/TimelineBadness';
import { useBadnessReport } from './hooks/useBadnessReport';
import { useBadnessReportColumns } from './components/BadnessReportColumns';
import { BadnessReportHeader } from './components/BadnessReportHeader';
import { BadnessReportDataGrid } from './components/BadnessReportDataGrid';
import { BadnessReportMobileView } from './components/BadnessReportMobileView';

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
    id='badness-report-detail-dialog-close-button'
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

const BadnessAllReportPage = () => {
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
    loadingBadnessSearch,
    isPending,
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
  } = useBadnessReport();

  // Columns configuration
  const columns = useBadnessReportColumns({
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
  const selectedDate = watch('badDate') || null;

  // Get row ID helper
  const getRowId = (row: any) => row.id || row.studentId || `${row.studentId}-${Math.random()}`;

  return (
    ability?.can('read', 'report-badness-page') &&
    auth?.user?.role !== 'Admin' && (
      <React.Fragment>
        <Box id='badness-report-page' sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Grid id='badness-report-grid-container' container spacing={responsiveConfig.containerSpacing}>
            <Grid id='badness-report-grid-item' size={12}>
              <Box
                id='badness-report-main-container'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                }}
              >
                {/* Header Section */}
                <BadnessReportHeader
                  selectedClassroomName={selectedClassroomName}
                  selectedDate={selectedDate}
                  totalItems={currentStudents?.length ?? 0}
                />

                {/* Content Section */}
                <Box
                  id='badness-report-content'
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.paper',
                    position: 'relative',
                    flex: 1,
                    height: '100%',
                  }}
                >
                  {/* Controls Section */}
                  <Box
                    id='badness-report-controls-section'
                    sx={{
                      flexShrink: 0,
                      px: { xs: 4, sm: 6 },
                      py: { xs: 4, sm: 6 },
                      borderBottom: 0,
                      borderRadius: 4,
                    }}
                  >
                    <TableHeader
                      control={control}
                      classroomLoading={classroomLoading as boolean}
                      classrooms={classrooms}
                      datePickLabel='วันที่บันทึกพฤติกรรมที่ไม่เหมาะสม'
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
                    <Box id='badness-report-mobile-view-container'>
                      <BadnessReportMobileView
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
                    <Box id='badness-report-desktop-view-container'>
                      <BadnessReportDataGrid
                        columns={columns}
                        rows={currentStudents}
                        loading={loadingBadnessSearch}
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
          id='badness-report-detail-dialog'
          fullWidth
          maxWidth='md'
          onClose={handleClose}
          aria-labelledby='badness-detail-dialog-title'
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
          <Box id='badness-report-detail-dialog-content'>
            {handleClose && <DialogCloseButton onClose={handleClose} />}
            <TimelineBadness info={info} user={auth.user} />
          </Box>
        </BootstrapDialog>
      </React.Fragment>
    )
  );
};

export default BadnessAllReportPage;
