'use client';

import { useMemo } from 'react';
import {
  Avatar,
  Box,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { HiFlag } from 'react-icons/hi';
import { useCheckInReport } from '@/hooks/features/check-in/useCheckInReport';
import CheckInControls from './components/CheckInControls';
import CheckInDataGrid from './components/CheckInDataGrid';

const CheckInReportPage = () => {
  const theme = useTheme();

  // Memoize current date to avoid calling Date.now() during render
  const currentDateString = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const {
    responsiveConfig,
    currentStudents,
    classrooms,
    defaultClassroom,
    classroomLoading,
    classroomError,
    pageSize,
    currentPage,
    isPresentCheck,
    isPresentCheckAll,
    isAbsentCheck,
    isAbsentCheckAll,
    isLateCheck,
    isLateCheckAll,
    isLeaveCheck,
    isLeaveCheckAll,
    isInternshipCheck,
    isInternshipCheckAll,
    hasSavedCheckIn,
    isSaving,
    handleSelectChange,
    handleCellClick,
    handleColumnHeaderClick,
    handleSaveCheckIn,
    handlePaginationModelChange,
  } = useCheckInReport();

  return (
    <div 
      id='checkin-page-fragment'
      style={{ borderRadius: '8px', overflow: 'hidden' }}
    >
      <Grid id='checkin-main-container' container spacing={responsiveConfig.containerSpacing}>
        <Grid size={{ xs: 12 }}>
          <Box
            id='checkin-main-container-box'
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              backgroundColor: 'background.paper',
            }}
          >
            {/* Header Section */}
            <Box
              id='checkin-header'
              sx={{
                p: 3,
                pb: 2,
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main, mt: 0.5 }}>
                  <HiFlag style={{ color: theme.palette.common.white }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='h6' component='div' sx={{ fontWeight: 600, mb: 0.5 }}>
                    เช็คชื่อตอนเข้า กิจกรรมหน้าเสาธง
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Box component='span' sx={{ color: 'primary.main', fontWeight: 600 }}>
                      ชั้น {defaultClassroom?.name || 'ไม่ระบุ'}
                    </Box>
                    <Box component='span' sx={{ color: 'text.secondary' }}>
                      •
                    </Box>
                    <Box component='span'>จำนวน {currentStudents?.length ?? 0} คน</Box>
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {currentDateString}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Content Section */}
            <Box
              id='checkin-content'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper',
              }}
            >
              {/* Loading State */}
              {classroomLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <Typography>กำลังโหลดข้อมูล...</Typography>
                </Box>
              )}

              {/* Empty State */}
              {!classroomLoading && !classroomError && !classrooms.length && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <Typography sx={{
                    color: 'text.secondary'
                  }}>ไม่พบข้อมูลห้องเรียน</Typography>
                </Box>
              )}

              {/* Fixed Controls Section */}
              {!classroomLoading && !classroomError && classrooms.length > 0 && (
                <Box
                  sx={{
                    flexShrink: 0,
                    p: responsiveConfig.cardPadding,
                    pb: 2,
                  }}
                >
                  <CheckInControls
                    isMobile={responsiveConfig.isMobile}
                    isTablet={responsiveConfig.isTablet}
                    isSmallMobile={responsiveConfig.isSmallMobile}
                    classrooms={classrooms}
                    defaultClassroom={defaultClassroom}
                    currentStudentsCount={currentStudents?.length ?? 0}
                    isComplete={
                      isPresentCheck.length +
                        isAbsentCheck.length +
                        isLateCheck.length +
                        isLeaveCheck.length +
                        isInternshipCheck.length ===
                        (currentStudents?.length ?? 0) && (currentStudents?.length ?? 0) > 0
                    }
                    loading={isSaving}
                    hasSavedCheckIn={hasSavedCheckIn}
                    formSize={responsiveConfig.formSize}
                    inputFontSize={responsiveConfig.inputFontSize}
                    inputPadding={responsiveConfig.inputPadding}
                    buttonSize={responsiveConfig.buttonSize}
                    buttonMinWidth={responsiveConfig.buttonMinWidth}
                    buttonFontSize={responsiveConfig.buttonFontSize}
                    onClassroomChange={handleSelectChange}
                    onSaveCheckIn={handleSaveCheckIn}
                  />
                </Box>
              )}

              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CheckInDataGrid
                  students={currentStudents}
                  loading={classroomLoading}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  isPresentCheckAll={isPresentCheckAll}
                  isAbsentCheckAll={isAbsentCheckAll}
                  isLateCheckAll={isLateCheckAll}
                  isLeaveCheckAll={isLeaveCheckAll}
                  isInternshipCheckAll={isInternshipCheckAll}
                  isPresentCheck={isPresentCheck}
                  isAbsentCheck={isAbsentCheck}
                  isLateCheck={isLateCheck}
                  isLeaveCheck={isLeaveCheck}
                  isInternshipCheck={isInternshipCheck}
                  hasSavedCheckIn={hasSavedCheckIn}
                  onPaginationModelChange={handlePaginationModelChange}
                  onCellClick={handleCellClick}
                  onColumnHeaderClick={handleColumnHeaderClick}
                />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default CheckInReportPage;
