'use client';

import { useContext, useState, useEffect, useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { HiFlag } from 'react-icons/hi';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { LocalStorageService } from '@/services/localStorageService';
import toast from 'react-hot-toast';
import StudentCard from './components/StudentCard';
import MobilePaginationControls from './components/MobilePaginationControls';
import CheckInControls from './components/CheckInControls';
import CheckInDataGrid from './components/CheckInDataGrid';

interface CellType {
  row: any;
}

const localStorageService = new LocalStorageService();
const storedToken = localStorageService.getToken()!;

const CheckInReportPage = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const alignCenter = useMediaQuery(theme.breakpoints.down('md')) ? 'center' : 'left';
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const [classrooms, setClassrooms] = useState<any>([]);
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [mobilePage, setMobilePage] = useState<number>(0);
  const [mobilePageSize, setMobilePageSize] = useState<number>(5);
  const [checkInDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classroomDropdownOpen, setClassroomDropdownOpen] = useState<boolean>(false);
  const [hasData, setHasData] = useState<boolean>(false);

  // Check-in status states
  const [isPresentCheck, setIsPresentCheck] = useState<any>([]);
  const [isPresentCheckAll, setIsPresentCheckAll] = useState(false);
  const [isAbsentCheck, setIsAbsentCheck] = useState<any>([]);
  const [isAbsentCheckAll, setIsAbsentCheckAll] = useState(false);
  const [isLateCheck, setIsLateCheck] = useState<any>([]);
  const [isLateCheckAll, setIsLateCheckAll] = useState(false);
  const [isLeaveCheck, setIsLeaveCheck] = useState<any>([]);
  const [isLeaveCheckAll, setIsLeaveCheckAll] = useState(false);
  const [isInternshipCheck, setIsInternshipCheck] = useState<any>([]);
  const [isInternshipCheckAll, setIsInternshipCheckAll] = useState(false);

  // ดึงข้อมูลห้องเรียนของครู
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.user?.teacher?.id) return;

      try {
        setLoading(true);
        const classroomData = await apiService.getTeacherClassroomsAndStudents(auth.user.teacher.id);

        // Handle both direct data and nested data structure
        const actualData = classroomData.data || classroomData;
        setHasData(!!actualData);

        if (!actualData || !actualData.classrooms || !actualData.classrooms.length) {
          setLoading(false);
          return;
        }

        const [classroom] = actualData.classrooms;

        if (!classroom) {
          setLoading(false);
          return;
        }

        if (!classroom.students || classroom.students.length === 0) {
          setDefaultClassroom(classroom);
          setClassrooms(actualData.classrooms);
          setCurrentStudents([]);
          setPageSize(10); // Default page size when no students
          setCurrentPage(0); // Reset to first page
          setMobilePage(0); // Reset mobile page
        } else {
          const studentCount = classroom.students?.length || 0;
          setDefaultClassroom(classroom);
          setClassrooms(actualData.classrooms);
          setCurrentStudents(classroom.students || []);
          setPageSize(studentCount > 0 ? Math.min(studentCount, 10) : 10);
          setCurrentPage(0); // Reset to first page when loading new data
          setMobilePage(0); // Reset mobile page when loading new data
        }
      } catch (error) {
        console.error('Error fetching teacher classrooms:', error);
        toast.error('ไม่สามารถโหลดข้อมูลห้องเรียนได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.user?.teacher?.id]);

  // Handle classroom selection change
  const handleSelectChange = async (event: any) => {
    event.preventDefault();
    const {
      target: { value },
    } = event;
    const classroomObj: any = classrooms.find((item: any) => item.name === value);

    if (classroomObj) {
      setCurrentStudents(classroomObj.students || []);
      setDefaultClassroom(classroomObj);
      setPageSize(classroomObj.students?.length || 5);
      setCurrentPage(0); // Reset to first page when changing classroom
      setMobilePage(0); // Reset mobile page when changing classroom

      // Clear all selections when changing classroom
      onClearAll('');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (classroomDropdownOpen && !(event.target as Element).closest('.classroom-dropdown')) {
        setClassroomDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [classroomDropdownOpen]);

  const handleCellClick = (params: any) => {
    onHandleToggle(params.field, params.row);
  };

  const handleColumnHeaderClick = (params: any) => {
    onHandleCheckAll(params.field);
  };

  // Handle individual checkbox changes
  const onHandleToggle = (action: string, param: any): void => {
    switch (action) {
      case 'present':
        handleTogglePresent(param);
        break;
      case 'absent':
        handleToggleAbsent(param);
        break;
      case 'late':
        handleToggleLate(param);
        break;
      case 'leave':
        handleToggleLeave(param);
        break;
      case 'internship':
        handleToggleInternship(param);
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

  const handleToggleLate = (param: any): void => {
    setIsLateCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLeave = (param: any): void => {
    setIsLeaveCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleInternship = (param: any): void => {
    setIsInternshipCheck((prevState: any) => {
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
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        onHandleInternshipChecked(param);
        break;
      case 'absent':
        onHandlePresentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        onHandleInternshipChecked(param);
        break;
      case 'late':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLeaveChecked(param);
        onHandleInternshipChecked(param);
        break;
      case 'leave':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleInternshipChecked(param);
        break;
      case 'internship':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
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

  const onHandleLateChecked = (param: any): void => {
    if (isLateCheck.includes(param.id)) {
      setIsLateCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLeaveChecked = (param: any): void => {
    if (isLeaveCheck.includes(param.id)) {
      setIsLeaveCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleInternshipChecked = (param: any): void => {
    if (isInternshipCheck.includes(param.id)) {
      setIsInternshipCheck((prevState: any) => {
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

  // Handle select all checkboxes
  const onHandleCheckAll = (action: string): void => {
    switch (action) {
      case 'present':
        handleTogglePresentAll();
        break;
      case 'absent':
        handleToggleAbsentAll();
        break;
      case 'late':
        handleToggleLateAll();
        break;
      case 'leave':
        handleToggleLeaveAll();
        break;
      case 'internship':
        handleToggleInternshipAll();
        break;
      default:
        break;
    }
    onClearAll(action);
  };

  const handleTogglePresentAll = (): void => {
    setIsPresentCheckAll(!isPresentCheckAll);
    setIsPresentCheck(currentStudents.map((student: any) => student.id));
    if (isPresentCheckAll) {
      setIsPresentCheck([]);
    }
  };

  const handleToggleAbsentAll = (): void => {
    setIsAbsentCheckAll(!isAbsentCheckAll);
    setIsAbsentCheck(currentStudents.map((student: any) => student.id));
    if (isAbsentCheckAll) {
      setIsAbsentCheck([]);
    }
  };

  const handleToggleLateAll = (): void => {
    setIsLateCheckAll(!isLateCheckAll);
    setIsLateCheck(currentStudents.map((student: any) => student.id));
    if (isLateCheckAll) {
      setIsLateCheck([]);
    }
  };

  const handleToggleLeaveAll = (): void => {
    setIsLeaveCheckAll(!isLeaveCheckAll);
    setIsLeaveCheck(currentStudents.map((student: any) => student.id));
    if (isLeaveCheckAll) {
      setIsLeaveCheck([]);
    }
  };

  const handleToggleInternshipAll = (): void => {
    setIsInternshipCheckAll(!isInternshipCheckAll);
    setIsInternshipCheck(currentStudents.map((student: any) => student.id));
    if (isInternshipCheckAll) {
      setIsInternshipCheck([]);
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
    if (action !== 'late') {
      setIsLateCheckAll(false);
      setIsLateCheck([]);
    }
    if (action !== 'leave') {
      setIsLeaveCheckAll(false);
      setIsLeaveCheck([]);
    }
    if (action !== 'internship') {
      setIsInternshipCheckAll(false);
      setIsInternshipCheck([]);
    }
  };

  const handleSaveCheckIn = async () => {
    if (!auth.user?.teacher?.id || !defaultClassroom?.id) {
      toast.error('กรุณาเลือกห้องเรียนและเข้าสู่ระบบ');
      return;
    }

    try {
      setLoading(true);

      const checkInData = {
        teacherId: auth.user.teacher.id,
        classroomId: defaultClassroom.id,
        checkInDate: checkInDate,
        present: isPresentCheck,
        absent: isAbsentCheck,
        late: isLateCheck,
        leave: isLeaveCheck,
        internship: isInternshipCheck,
      };

      console.log('Check-in Data:', checkInData);

      await apiService.saveCheckInData(checkInData);

      // Clear all selections after saving
      setIsPresentCheck([]);
      setIsPresentCheckAll(false);
      setIsAbsentCheck([]);
      setIsAbsentCheckAll(false);
      setIsLateCheck([]);
      setIsLateCheckAll(false);
      setIsLeaveCheck([]);
      setIsLeaveCheckAll(false);
      setIsInternshipCheck([]);
      setIsInternshipCheckAll(false);

      toast.success('บันทึกข้อมูลการเช็คชื่อเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error saving check-in data:', error);
      toast.error('ไม่สามารถบันทึกข้อมูลการเช็คชื่อได้');
    } finally {
      setLoading(false);
    }
  };

  // Mobile pagination functions
  const getPaginatedStudents = () => {
    const startIndex = mobilePage * mobilePageSize;
    const endIndex = startIndex + mobilePageSize;
    return currentStudents.slice(startIndex, endIndex);
  };

  const handleMobilePageChange = (newPage: number) => {
    setMobilePage(newPage);
    // Scroll to top of the list when changing page
    const scrollContainer = document.getElementById('checkin-mobile-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMobilePageSizeChange = (newPageSize: number) => {
    setMobilePageSize(newPageSize);
    setMobilePage(0); // Reset to first page when changing page size
  };

  const getTotalMobilePages = () => {
    return Math.ceil((currentStudents?.length ?? 0) / mobilePageSize);
  };

  const getStudentStatus = (studentId: any) => {
    if (isPresentCheck.includes(studentId)) return { status: 'มาเรียน', color: 'success' as const };
    if (isAbsentCheck.includes(studentId)) return { status: 'ขาดเรียน', color: 'error' as const };
    if (isLateCheck.includes(studentId)) return { status: 'มาสาย', color: 'warning' as const };
    if (isLeaveCheck.includes(studentId)) return { status: 'ลา', color: 'info' as const };
    if (isInternshipCheck.includes(studentId)) return { status: 'ฝึกงาน', color: 'secondary' as const };
    return { status: 'ยังไม่เช็ค', color: 'default' as const };
  };

  return (
    <div id='checkin-page-fragment'>
      <Grid id='checkin-main-container' container spacing={responsiveConfig.containerSpacing}>
        <Grid size={{ xs: 12 }}>
          <Card
            id='checkin-main-card'
            sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <CardHeader
              id='checkin-card-header'
              avatar={
                <Avatar id='checkin-header-avatar' sx={{ bgcolor: 'info.main' }} aria-label='recipe'>
                  <HiFlag />
                </Avatar>
              }
              sx={{
                color: 'text.primary',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                backgroundColor: 'background.paper',
                pb: 2,
              }}
              title={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
                    {`เช็คชื่อตอนเข้า กิจกรรมหน้าเสาธง`}
                  </Typography>
                  <Typography
                    id='checkin-classroom-info'
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
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
                </Box>
              }
              subheader={
                <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {new Date(Date.now()).toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              }
            />
            <CardContent
              id='checkin-card-content'
              sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* Fixed Controls Section */}
              {(currentStudents?.length ?? 0) > 0 && (
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
                    selectedStudentsCount={
                      isPresentCheck.length +
                      isAbsentCheck.length +
                      isLateCheck.length +
                      isLeaveCheck.length +
                      isInternshipCheck.length
                    }
                    isComplete={
                      isPresentCheck.length +
                        isAbsentCheck.length +
                        isLateCheck.length +
                        isLeaveCheck.length +
                        isInternshipCheck.length ===
                        (currentStudents?.length ?? 0) && (currentStudents?.length ?? 0) > 0
                    }
                    loading={loading}
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
                    label={`${isPresentCheck.length + isAbsentCheck.length + isLateCheck.length + isLeaveCheck.length + isInternshipCheck.length}`}
                    color={
                      isPresentCheck.length +
                        isAbsentCheck.length +
                        isLateCheck.length +
                        isLeaveCheck.length +
                        isInternshipCheck.length ===
                        (currentStudents?.length ?? 0) && (currentStudents?.length ?? 0) > 0
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
                    id='checkin-mobile-scroll-container'
                    sx={{
                      flex: 1,
                      overflow: 'auto',
                      p: responsiveConfig.cardPadding,
                      pb: '270px', // Add padding for pagination and floating badge
                      scrollBehavior: 'smooth',
                      minHeight: 0, // Allow flex item to shrink below content size
                    }}
                  >
                    <Box
                      id='checkin-mobile-view'
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, 1fr)',
                        gap: responsiveConfig.isSmallMobile ? 1 : 1.5,
                      }}
                    >
                      {getPaginatedStudents().map((student: any) => {
                        const { status, color } = getStudentStatus(student.id);

                        return (
                          <StudentCard
                            key={student.id}
                            student={student}
                            storedToken={storedToken}
                            status={status}
                            color={color}
                            isPresentCheck={isPresentCheck}
                            isAbsentCheck={isAbsentCheck}
                            isLateCheck={isLateCheck}
                            isLeaveCheck={isLeaveCheck}
                            isInternshipCheck={isInternshipCheck}
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
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <CheckInDataGrid
                    students={currentStudents}
                    loading={loading}
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
                    onPaginationModelChange={(model) => {
                      setCurrentPage(model.page);
                      setPageSize(model.pageSize);
                    }}
                    onCellClick={handleCellClick}
                    onColumnHeaderClick={handleColumnHeaderClick}
                    storedToken={storedToken}
                  />
                </Box>
              )}

              {/* Show empty state when no students and not loading */}
              {(currentStudents?.length ?? 0) === 0 && !loading && (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box id='checkin-empty-state' sx={{ textAlign: 'center', py: 8 }}>
                    <Typography id='checkin-empty-title' variant='h6' color='text.secondary'>
                      ไม่มีข้อมูลนักเรียนในห้องเรียนนี้
                    </Typography>
                    <Typography id='checkin-empty-message' variant='body2' color='text.secondary'>
                      กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มนักเรียนในห้องเรียน
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Show loading state or when no classrooms available */}
              {(loading ||
                ((currentStudents?.length ?? 0) === 0 && !loading && classrooms && (classrooms?.length ?? 0) > 0)) && (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box id='checkin-loading-state' sx={{ textAlign: 'center', py: 8 }}>
                    <Typography id='checkin-loading-title' variant='h6' color='text.secondary'>
                      {loading ? 'กำลังโหลดข้อมูล...' : 'ไม่มีข้อมูลนักเรียนในห้องเรียนนี้'}
                    </Typography>
                    {!loading && (
                      <Typography id='checkin-loading-message' variant='body2' color='text.secondary'>
                        กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มนักเรียนในห้องเรียน
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CheckInReportPage;
