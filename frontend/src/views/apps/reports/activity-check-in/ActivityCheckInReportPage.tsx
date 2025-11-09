'use client';

import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Icon from '@/@core/components/icon';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherStudents } from '@/hooks/queries/useTeachers';
import { useActivityCheckIn, useAddActivityCheckIn } from '@/hooks/queries/useActivityCheckIn';
import { toast } from 'react-toastify';
import ActivityStudentCard from './components/ActivityStudentCard';
import MobilePaginationControls from '@/views/apps/reports/check-in/components/MobilePaginationControls';
import CheckInControls from '@/views/apps/reports/check-in/components/CheckInControls';
import ActivityCheckInDataGrid from './components/ActivityCheckInDataGrid';
import { shallow } from 'zustand/shallow';
import { useRouter } from 'next/navigation';
import { AbilityContext } from '@/layouts/components/acl/Can';

const ActivityCheckInReportPage = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const ability = useContext(AbilityContext);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  // ** React Query - Fetch teacher's students and classrooms
  const teacherId = auth?.user?.teacher?.id as string;
  const {
    data: teacherData,
    isLoading: isLoadingTeacherData,
  } = useTeacherStudents(teacherId);

  // ** Local State for classroom
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);

  // ** React Query - Fetch activity check-in data
  const {
    data: activityCheckInData,
    isLoading: isLoadingCheckIn,
    refetch: refetchCheckIn,
  } = useActivityCheckIn({
    teacher: teacherId,
    classroom: defaultClassroom?.id || '',
  });

  // ** React Query - Add activity check-in mutation
  const addCheckInMutation = useAddActivityCheckIn();

  // Memoize responsive values to prevent unnecessary re-renders
  const responsiveConfig = useMemo(
    () => ({
      isMobile,
      isTablet,
      isSmallMobile,
      cardPadding: isMobile ? 2 : 3,
      formSize: (isMobile ? 'small' : 'medium') as 'small' | 'medium',
      gridSpacing: isMobile ? 3 : 4,
      containerSpacing: isMobile ? 4 : 6,
      buttonSize: 'small' as 'small' | 'medium',
      titleVariant: isMobile ? 'h6' : 'h5',
      titleFontSize: isMobile ? '1.1rem' : '1.25rem',
      subheaderVariant: isMobile ? 'body2' : 'body1',
      dataGridRowHeight: isTablet ? 70 : 80,
      dataGridFontSize: isMobile ? '0.75rem' : isTablet ? '0.8rem' : '0.875rem',
      dataGridPadding: isMobile ? '8px' : '16px',
      inputPadding: isMobile ? '12px 14px' : '16.5px 14px',
      inputFontSize: isMobile ? '0.9rem' : '1rem',
      chipSize: (isMobile ? 'small' : 'medium') as 'small' | 'medium',
      chipMinWidth: isMobile ? 60 : 80,
      buttonMinWidth: isMobile ? 'auto' : '80px',
      buttonFontSize: isMobile ? '0.8rem' : '0.875rem',
    }),
    [isMobile, isTablet, isSmallMobile],
  );

  // ** Local State
  const [currentStudents, setCurrentStudents] = useState<any>([]);
  const [normalStudents, setNormalStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [mobilePage, setMobilePage] = useState<number>(0);
  const [mobilePageSize, setMobilePageSize] = useState<number>(5);
  const [isPresentCheckAll, setIsPresentCheckAll] = useState(false);
  const [isAbsentCheckAll, setIsAbsentCheckAll] = useState(false);
  const [isPresentCheck, setIsPresentCheck] = useState<any>([]);
  const [isAbsentCheck, setIsAbsentCheck] = useState<any>([]);
  const [hasSavedCheckIn, setHasSavedCheckIn] = useState<boolean>(false);

  // Combine loading states
  const loading = isLoadingTeacherData || isLoadingCheckIn;

  // Authorization check - run once on mount
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    
    const isInRole = (auth?.user?.role as string) === 'Admin';
    if (!ability?.can('read', 'check-in-page') || isInRole) {
      router.push('/401');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Process activity check-in data when available
  useEffect(() => {
    if (!activityCheckInData) {
      // No check-in data exists - reset everything
      setHasSavedCheckIn(false);
      setIsPresentCheck([]);
      setIsAbsentCheck([]);
      setIsPresentCheckAll(false);
      setIsAbsentCheckAll(false);
      return;
    }

    // Check if data exists and has valid structure
    const hasValidData = activityCheckInData &&
      typeof activityCheckInData === 'object' &&
      Object.keys(activityCheckInData).length > 0 &&
      (activityCheckInData.id || activityCheckInData.present || activityCheckInData.absent || activityCheckInData.data);

    if (hasValidData) {
      // Handle nested data structure
      const reportData = activityCheckInData?.data || activityCheckInData;
      setHasSavedCheckIn(true);

      if (reportData?.present && Array.isArray(reportData.present) && reportData.present.length > 0) {
        setIsPresentCheck(reportData.present);
      } else {
        setIsPresentCheck([]);
      }

      if (reportData?.absent && Array.isArray(reportData.absent) && reportData.absent.length > 0) {
        setIsAbsentCheck(reportData.absent);
      } else {
        setIsAbsentCheck([]);
      }
    } else {
      setHasSavedCheckIn(false);
      setIsPresentCheck([]);
      setIsAbsentCheck([]);
      setIsPresentCheckAll(false);
      setIsAbsentCheckAll(false);
    }
  }, [activityCheckInData]);

  // Process teacher data when available
  useEffect(() => {
    if (!teacherData?.classrooms || !teacherData.classrooms.length) {
      return;
    }

    const [classroom] = teacherData.classrooms;

    if (!classroom) {
      return;
    }

    const { students } = classroom;

    if (!students || !students.length) {
      return;
    }

    // Initialize state with first classroom
    setDefaultClassroom(classroom);
    setClassrooms(teacherData.classrooms);
    setCurrentStudents(students);
    setNormalStudents(students.filter((student: any) => student?.status !== 'internship'));

    // Set pageSize to a valid option based on student count
    const validPageSizeOptions = [5, 10, 25, 50, 100];
    const studentCount = students.length;
    const appropriatePageSize = validPageSizeOptions.find(size => size >= studentCount) || validPageSizeOptions[validPageSizeOptions.length - 1];
    setPageSize(appropriatePageSize);
  }, [teacherData]);

  const onHandleToggle = (action: string, param: any): void => {
    switch (action) {
      case 'present':
        handleTogglePresent(param);
        break;
      case 'absent':
        handleToggleAbsent(param);
        break;
      default:
        break;
    }
    onRemoveToggleOthers(action, param);
  };

  const handleTogglePresent = (param: any): void => {
    setIsPresentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleAbsent = (param: any): void => {
    setIsAbsentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const onSetToggle = (prevState: any, param: any): any => {
    const prevSelection = prevState;
    const index = prevSelection.indexOf(param.id);

    let newSelection: any[] = [];

    if (index === -1) {
      newSelection = newSelection.concat(prevSelection, param.id);
    } else if (index === 0) {
      newSelection = newSelection.concat(prevSelection.slice(1));
    } else if (index === prevSelection.length - 1) {
      newSelection = newSelection.concat(prevSelection.slice(0, -1));
    } else if (index > 0) {
      newSelection = newSelection.concat(prevSelection.slice(0, index), prevSelection.slice(index + 1));
    }
    return newSelection;
  };

  const onRemoveToggleOthers = (action: string, param: any): void => {
    switch (action) {
      case 'present':
        onHandleAbsentChecked(param);
        break;
      case 'absent':
        onHandlePresentChecked(param);
        break;
      default:
        break;
    }
  };

  const onHandlePresentChecked = (param: any): void => {
    if (isPresentCheck.includes(param.id)) {
      setIsPresentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleAbsentChecked = (param: any): void => {
    if (isAbsentCheck.includes(param.id)) {
      setIsAbsentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onRemoveToggle = (prevState: any, param: any): any => {
    const prevSelection = prevState;
    const index = prevSelection.indexOf(param.id);

    let newSelection: any[] = [];

    if (index !== -1) {
      newSelection = newSelection.concat(prevSelection.slice(0, index), prevSelection.slice(index + 1));
    }

    return newSelection;
  };

  const onHandleCheckAll = (action: string): void => {
    if (action === 'present') {
      handleTogglePresentAll();
    } else if (action === 'absent') {
      handleToggleAbsentAll();
    }

    onClearAll(action);
  };

  const handleTogglePresentAll = (): void => {
    setIsPresentCheckAll(!isPresentCheckAll);
    setIsPresentCheck(normalStudents.map((student: any) => student.id));
    if (isPresentCheckAll) {
      setIsPresentCheck([]);
    }
  };

  const handleToggleAbsentAll = (): void => {
    setIsAbsentCheckAll(!isAbsentCheckAll);
    setIsAbsentCheck(normalStudents.map((student: any) => student.id));
    if (isAbsentCheckAll) {
      setIsAbsentCheck([]);
    }
  };

  const onClearAll = (action: string): void => {
    if (action !== 'present') {
      setIsPresentCheckAll(false);
      setIsPresentCheck([]);
    }
    if (action !== 'absent') {
      setIsAbsentCheckAll(false);
      setIsAbsentCheck([]);
    }
  };

  const handleCellClick = (params: any) => {
    if (!hasSavedCheckIn && params.row.status !== 'internship') {
      onHandleToggle(params.field, params.row);
    }
  };

  const handleColumnHeaderClick = (params: any) => {
    if (!hasSavedCheckIn) {
      onHandleCheckAll(params.field);
    }
  };

  // Get student status for display
  const getStudentStatus = (studentId: any) => {
    if (isPresentCheck.includes(studentId)) return { status: 'เข้าร่วม', color: 'success' as const };
    if (isAbsentCheck.includes(studentId)) return { status: 'ไม่เข้าร่วม', color: 'error' as const };
    return { status: 'ยังไม่เช็ค', color: 'default' as const };
  };

  // Mobile pagination helpers
  const getPaginatedStudents = () => {
    const startIndex = mobilePage * mobilePageSize;
    const endIndex = startIndex + mobilePageSize;
    return currentStudents.slice(startIndex, endIndex);
  };

  const getTotalMobilePages = () => {
    return Math.ceil((currentStudents?.length ?? 0) / mobilePageSize);
  };

  const handleMobilePageChange = (newPage: number) => {
    setMobilePage(newPage);
  };

  const handleMobilePageSizeChange = (newPageSize: number) => {
    setMobilePageSize(newPageSize);
    setMobilePage(0);
  };

  // Submit handler
  const handleSaveCheckIn = async () => {
    if (!defaultClassroom) return;

    const data = {
      teacherId: auth?.user?.teacher?.id as string,
      classroomId: defaultClassroom.id,
      present: isPresentCheck,
      absent: isAbsentCheck,
      checkInDate: new Date(),
      status: '1',
    };

    const totalStudents = isPresentCheck.concat(isAbsentCheck).length;
    if (totalStudents === currentStudents.length && !hasSavedCheckIn) {
      try {
        await addCheckInMutation.mutateAsync(data);
        onClearAll('');
        toast.success('บันทึกเช็คชื่อสำเร็จ');
      } catch (error) {
        toast.error('เกิดข้อผิดพลาด');
      }
    } else {
      toast.error('กรุณาเช็คชื่อของนักเรียนทุกคนให้ครบถ้วน!');
    }
  };

  const handleSelectChange = async (event: any) => {
    event.preventDefault();
    const {
      target: { value },
    } = event;
    const classroomObj: any = classrooms.find((item: any) => item.name === value);

    if (classroomObj) {
      setCurrentStudents(classroomObj.students || []);
      setNormalStudents((classroomObj.students || []).filter((student: any) => student?.status !== 'internship'));
      setDefaultClassroom(classroomObj);

      // Ensure pageSize is in pageSizeOptions [5, 10, 25, 50, 100]
      const studentCount = classroomObj.students?.length || 0;
      const validPageSizes = [5, 10, 25, 50, 100];
      const calculatedSize = studentCount > 0 ? Math.min(studentCount, 100) : 5;
      const closestSize = validPageSizes.find(size => size >= calculatedSize) || validPageSizes[0];
      setPageSize(Math.min(closestSize, studentCount > 0 ? studentCount : 5));
      setCurrentPage(0);
      setMobilePage(0);

      // Refetch check-in data for new classroom
      await refetchCheckIn();
      onClearAll('');
    }
  };

  const isInRole = (auth?.user?.role as string) === 'Admin';
  if (!ability?.can('read', 'check-in-page') || isInRole) {
    router.push('/401');
    return null;
  }

  return (
    <div 
      id='activity-checkin-page-fragment'
      style={{ borderRadius: '8px', overflow: 'hidden' }}
    >
      <Grid id='activity-checkin-main-container' container spacing={responsiveConfig.containerSpacing}>
        <Grid size={{ xs: 12 }}>
          <Box
            id='activity-checkin-main-container-box'
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              backgroundColor: 'background.paper',
            }}
          >
            {/* Header Section */}
            <Box
              id='activity-checkin-header'
              sx={{
                p: 3,
                pb: 2,
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mt: 0.5 }}>
                  <Icon icon='pepicons-pop:flag' fontSize={24} color={theme.palette.common.white} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='h6' component='div' sx={{ fontWeight: 600, mb: 0.5 }}>
                    เช็คชื่อกิจกรรม
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
                    {new Date(Date.now()).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Content Section */}
            <Box
              id='activity-checkin-content'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper',
              }}
            >
              {/* Loading State */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <Typography>กำลังโหลดข้อมูล...</Typography>
                </Box>
              )}

              {/* Empty State */}
              {!loading && (!classrooms || !classrooms.length) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <Typography color='text.secondary'>ไม่พบข้อมูลห้องเรียน</Typography>
                </Box>
              )}

              {/* Fixed Controls Section */}
              {!loading && classrooms && classrooms.length > 0 && (
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
                      isPresentCheck.length + isAbsentCheck.length === (currentStudents?.length ?? 0) &&
                      (currentStudents?.length ?? 0) > 0
                    }
                    loading={false}
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

              {/* Floating Count Display for Mobile */}
              {responsiveConfig.isMobile && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 100,
                    right: 16,
                    zIndex: 1100,
                  }}
                >
                  <Chip
                    label={`${isPresentCheck.length + isAbsentCheck.length}`}
                    color={
                      isPresentCheck.length + isAbsentCheck.length === (currentStudents?.length ?? 0) &&
                      (currentStudents?.length ?? 0) > 0
                        ? 'success'
                        : 'warning'
                    }
                    variant='filled'
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      height: '36px',
                      minWidth: '36px',
                      borderRadius: '50%',
                      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& .MuiChip-label': {
                        px: 0,
                        py: 0,
                      },
                    }}
                  />
                </Box>
              )}

              {/* Scrollable Mobile View */}
              {responsiveConfig.isMobile ? (
                <>
                  <Box
                    id='activity-checkin-mobile-scroll-container'
                    sx={{
                      overflow: 'auto',
                      p: responsiveConfig.cardPadding,
                      pb: '270px', // Add padding for pagination and floating badge
                      scrollBehavior: 'smooth',
                    }}
                  >
                    <Box
                      id='activity-checkin-mobile-view'
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, 1fr)',
                        gap: responsiveConfig.isSmallMobile ? 1 : 1.5,
                      }}
                    >
                      {getPaginatedStudents().map((student: any) => {
                        const { status, color } = getStudentStatus(student.id);

                        return (
                          <ActivityStudentCard
                            key={student.id}
                            student={student}
                            status={status}
                            color={color}
                            isPresentCheck={isPresentCheck}
                            isAbsentCheck={isAbsentCheck}
                            hasSavedCheckIn={hasSavedCheckIn}
                            onCheckboxChange={(studentId: string, status: string) => {
                              const student = currentStudents.find((s: any) => s.id === studentId);
                              if (student) {
                                onHandleToggle(status, student);
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Mobile Pagination - Fixed at bottom */}
                  <Box
                    sx={{
                      position: 'fixed',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                      borderTop: 1,
                      borderColor: 'divider',
                      zIndex: 1000,
                      p: 1.5,
                    }}
                  >
                    <MobilePaginationControls
                      currentPage={mobilePage}
                      totalPages={getTotalMobilePages()}
                      pageSize={mobilePageSize}
                      totalItems={currentStudents?.length ?? 0}
                      onPageChange={handleMobilePageChange}
                      onPageSizeChange={handleMobilePageSizeChange}
                    />
                  </Box>
                </>
              ) : (
                /* Desktop View */
                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <ActivityCheckInDataGrid
                    students={currentStudents}
                    loading={loading}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    isPresentCheckAll={isPresentCheckAll}
                    isAbsentCheckAll={isAbsentCheckAll}
                    isPresentCheck={isPresentCheck}
                    isAbsentCheck={isAbsentCheck}
                    hasSavedCheckIn={hasSavedCheckIn}
                    onPaginationModelChange={(model) => {
                      setCurrentPage(model.page);
                      // Ensure pageSize is always one of the valid options
                      const validPageSizeOptions = [5, 10, 25, 50, 100];
                      const newPageSize = validPageSizeOptions.includes(model.pageSize)
                        ? model.pageSize
                        : validPageSizeOptions[0]; // Default to smallest if invalid
                      setPageSize(newPageSize);
                    }}
                    onCellClick={handleCellClick}
                    onColumnHeaderClick={handleColumnHeaderClick}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default ActivityCheckInReportPage;
