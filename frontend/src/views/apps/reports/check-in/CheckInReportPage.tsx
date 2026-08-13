'use client';

import { useMemo, useState } from 'react';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import ViewAgendaOutlined from '@mui/icons-material/ViewAgendaOutlined';
import ViewColumnOutlined from '@mui/icons-material/ViewColumnOutlined';
import { Alert, Box, Card, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useCheckInReport } from '@/hooks/features/check-in/useCheckInReport';
import CustomAvatar from '@/@core/components/mui/avatar';
import SHAPE_TOKENS from '@/@core/theme/tokens/shape';

import CheckInControls from './components/CheckInControls';
import CheckInDataGrid from './components/CheckInDataGrid';
import MobileStudentList from './components/MobileStudentList';

const CheckInReportPage = () => {
  // บนมือถือ: ค่าเริ่มต้นแสดงตารางแบบ desktop ('table') ผู้ใช้สามารถสลับไปมุมมองการ์ด ('cards') ได้
  const [mobileViewMode, setMobileViewMode] = useState<'table' | 'cards'>('table');

  const {
    responsiveConfig,
    currentStudents,
    classrooms,
    defaultClassroom,
    classroomLoading,
    classroomError,
    pageSize,
    currentPage,
    mobilePage,
    mobilePageSize,
    mobileStudentFilter,
    mobilePendingStudents,
    mobileFilteredStudentsCount,
    mobilePendingStudentsCount,
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
    selectedDate,
    isSaving,
    isResetting,
    handleSelectChange,
    handleCellClick,
    handleColumnHeaderClick,
    handleSaveCheckIn,
    handleResetCheckIn,
    handleDateChange,
    handleMobilePageChange,
    handleMobileStudentFilterChange,
    handlePaginationModelChange,
    getPaginatedStudents,
    getTotalMobilePages,
    onHandleToggle,
  } = useCheckInReport();

  const currentDateString = useMemo(() => {
    return (selectedDate ?? new Date()).toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  return (
    <Box id='checkin-page-fragment' sx={{ py: { xs: 0, md: 2 } }}>
      <Grid id='checkin-main-container' container spacing={responsiveConfig.containerSpacing}>
        <Grid size={{ xs: 12 }}>
          <Card
            id='checkin-main-container-box'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: SHAPE_TOKENS.surface,
              backgroundColor: 'background.paper',
              boxShadow: {
                xs: 'none',
                md: (theme) =>
                  `0 8px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.16 : 0.04)}`,
              },
            }}
          >
            {/* Header Section */}
            <Box
              id='checkin-header'
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                backgroundColor: 'background.paper',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 3 }}
                sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
              >
                <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                  <CustomAvatar
                    skin='light'
                    color='primary'
                    sx={{ width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 }, flexShrink: 0 }}
                  >
                    <FlagOutlined fontSize='small' />
                  </CustomAvatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant='h5'
                      component='h1'
                      sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: { xs: '1.125rem', sm: '1.5rem' } }}
                    >
                      เช็คชื่อกิจกรรมหน้าเสาธง
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                      เลือกสถานะของนักเรียนแต่ละคน แล้วบันทึกเมื่อเช็คชื่อครบทุกคน
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction='row'
                  spacing={2}
                  useFlexGap
                  sx={{ alignItems: 'center', flexWrap: 'wrap', color: 'text.secondary' }}
                >
                  <Stack direction='row' spacing={0.75} sx={{ alignItems: 'center' }}>
                    <GroupsOutlined fontSize='small' />
                    <Typography variant='body2' sx={{ color: 'inherit', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {currentStudents?.length ?? 0} คน
                    </Typography>
                  </Stack>
                  <Stack direction='row' spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <CalendarMonthOutlined fontSize='small' />
                    <Typography variant='body2' sx={{ color: 'inherit', fontWeight: 500 }}>
                      {currentDateString}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
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
                <Box sx={{ p: 4 }}>
                  <Alert severity='info' variant='outlined' sx={{ borderRadius: SHAPE_TOKENS.surface }}>
                    กำลังโหลดข้อมูลห้องเรียน...
                  </Alert>
                </Box>
              )}

              {!classroomLoading && classroomError && (
                <Box sx={{ p: 4 }}>
                  <Alert severity='error' variant='outlined' sx={{ borderRadius: SHAPE_TOKENS.surface }}>
                    ไม่สามารถโหลดข้อมูลห้องเรียนได้ กรุณาลองใหม่อีกครั้ง
                  </Alert>
                </Box>
              )}

              {/* Empty State */}
              {!classroomLoading && !classroomError && !classrooms.length && (
                <Box sx={{ p: 4 }}>
                  <Alert severity='info' variant='outlined' sx={{ borderRadius: SHAPE_TOKENS.surface }}>
                    ไม่พบข้อมูลห้องเรียน
                  </Alert>
                </Box>
              )}

              {/* Fixed Controls Section */}
              {!classroomLoading && !classroomError && classrooms.length > 0 && (
                <Box
                  sx={{
                    flexShrink: 0,
                    px: responsiveConfig.cardPadding,
                    py: 2,
                    backgroundColor: 'action.hover',
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
                    developmentReset={
                      process.env.NODE_ENV === 'development' ? { isResetting, onReset: handleResetCheckIn } : undefined
                    }
                    selectedDate={selectedDate}
                    formSize={responsiveConfig.formSize}
                    inputFontSize={responsiveConfig.inputFontSize}
                    inputPadding={responsiveConfig.inputPadding}
                    buttonSize={responsiveConfig.buttonSize}
                    buttonMinWidth={responsiveConfig.buttonMinWidth}
                    buttonFontSize={responsiveConfig.buttonFontSize}
                    onClassroomChange={handleSelectChange}
                    onDateChange={handleDateChange}
                    onSaveCheckIn={handleSaveCheckIn}
                  />
                </Box>
              )}

              {!classroomLoading && !classroomError && classrooms.length > 0 && (
                <Box
                  sx={{
                    width: '100%',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    p: { xs: 2, md: 3 },
                  }}
                >
                  {responsiveConfig.isMobile && (
                    <ToggleButtonGroup
                      value={mobileViewMode}
                      exclusive
                      fullWidth
                      size='small'
                      onChange={(_, value: 'table' | 'cards' | null) => {
                        if (value) setMobileViewMode(value);
                      }}
                      aria-label='สลับรูปแบบการแสดงผลรายชื่อนักเรียน'
                      sx={(theme) => ({
                        '--checkin-view-inset': SHAPE_TOKENS.inset,
                        '--checkin-view-outer-radius': SHAPE_TOKENS.surface,
                        gap: 'var(--checkin-view-inset)',
                        p: 'var(--checkin-view-inset)',
                        mb: 2,
                        borderRadius: 'var(--checkin-view-outer-radius)',
                        backgroundColor: 'action.hover',
                        '& .MuiToggleButtonGroup-grouped': {
                          minHeight: 40,
                          border: '0 !important',
                          borderRadius:
                            'max(0px, calc(var(--checkin-view-outer-radius) - var(--checkin-view-inset))) !important',
                          color: 'text.secondary',
                          fontWeight: 600,
                          textTransform: 'none',
                          transition: 'background-color 150ms cubic-bezier(0.65, 0, 0.35, 1)',
                          '&.Mui-selected': {
                            color: 'text.primary',
                            backgroundColor: 'background.paper',
                            boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.24 : 0.1)}`,
                            '&:hover': {
                              backgroundColor: 'background.paper',
                            },
                          },
                        },
                      })}
                    >
                      <ToggleButton id='checkin-view-table-btn' value='table' aria-label='แสดงแบบตาราง'>
                        <ViewColumnOutlined fontSize='small' />
                        <Typography component='span' variant='body2' sx={{ fontWeight: 600, ml: 0.5 }}>
                          ตาราง
                        </Typography>
                      </ToggleButton>
                      <ToggleButton id='checkin-view-cards-btn' value='cards' aria-label='แสดงแบบการ์ด'>
                        <ViewAgendaOutlined fontSize='small' />
                        <Typography component='span' variant='body2' sx={{ fontWeight: 600, ml: 0.5 }}>
                          การ์ด
                        </Typography>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )}

                  {responsiveConfig.isMobile && mobileViewMode === 'cards' ? (
                    <Box id='checkin-mobile-scroll-container'>
                      <MobileStudentList
                        students={currentStudents}
                        pendingStudents={mobilePendingStudents}
                        paginatedStudents={getPaginatedStudents()}
                        pendingStudentsCount={mobilePendingStudentsCount}
                        filteredStudentsCount={mobileFilteredStudentsCount}
                        studentFilter={mobileStudentFilter}
                        statusSelections={{
                          present: isPresentCheck,
                          absent: isAbsentCheck,
                          late: isLateCheck,
                          leave: isLeaveCheck,
                          internship: isInternshipCheck,
                        }}
                        hasSavedCheckIn={hasSavedCheckIn}
                        currentPage={mobilePage}
                        totalPages={getTotalMobilePages()}
                        pageSize={mobilePageSize}
                        onFilterChange={handleMobileStudentFilterChange}
                        onStatusChange={(studentId, checkInStatus) => onHandleToggle(checkInStatus, studentId)}
                        onPageChange={handleMobilePageChange}
                      />
                    </Box>
                  ) : (
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
                  )}
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckInReportPage;
