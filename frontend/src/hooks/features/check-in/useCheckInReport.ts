import { useState, useEffect, useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherClassroomsAndStudents, useSaveCheckIn, useCheckInReports } from '@/hooks/queries/useCheckIn';

interface UseCheckInReportReturn {
  // Responsive config
  responsiveConfig: {
    isMobile: boolean;
    isTablet: boolean;
    isSmallMobile: boolean;
    cardPadding: number;
    formSize: 'small' | 'medium';
    gridSpacing: number;
    containerSpacing: number;
    buttonSize: 'small' | 'medium';
    titleVariant: 'h6' | 'h5';
    titleFontSize: string;
    subheaderVariant: 'body2' | 'body1';
    dataGridRowHeight: number;
    dataGridFontSize: string;
    dataGridPadding: string;
    inputPadding: string;
    inputFontSize: string;
    chipSize: 'small' | 'medium';
    chipMinWidth: number;
    buttonMinWidth: string | 'auto';
    buttonFontSize: string;
  };

  // Data
  currentStudents: any[];
  classrooms: any[];
  defaultClassroom: any | null;
  classroomLoading: boolean;
  classroomError: any;

  // Pagination
  pageSize: number;
  currentPage: number;
  mobilePage: number;
  mobilePageSize: number;

  // Check-in states
  isPresentCheck: any[];
  isPresentCheckAll: boolean;
  isAbsentCheck: any[];
  isAbsentCheckAll: boolean;
  isLateCheck: any[];
  isLateCheckAll: boolean;
  isLeaveCheck: any[];
  isLeaveCheckAll: boolean;
  isInternshipCheck: any[];
  isInternshipCheckAll: boolean;
  hasSavedCheckIn: boolean;

  // Loading states
  isSaving: boolean;

  // Handlers
  handleSelectChange: (event: any) => void;
  handleCellClick: (params: any) => void;
  handleColumnHeaderClick: (params: any) => void;
  handleSaveCheckIn: () => void;
  handleMobilePageChange: (newPage: number) => void;
  handleMobilePageSizeChange: (newPageSize: number) => void;
  handlePaginationModelChange: (model: { page: number; pageSize: number }) => void;
  getPaginatedStudents: () => any[];
  getTotalMobilePages: () => number;
  getStudentStatus: (studentId: any) => { status: string; color: 'success' | 'error' | 'warning' | 'info' | 'secondary' | 'default' };
  onHandleToggle: (action: string, param: any) => void;
}

export const useCheckInReport = (): UseCheckInReportReturn => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // React Query hooks
  const { data: classroomData, isLoading: classroomLoading, error: classroomError } = useTeacherClassroomsAndStudents(
    auth.user?.teacher?.id || ''
  );
  const { mutate: saveCheckIn, isPending: isSaving } = useSaveCheckIn();

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
      titleVariant: (isMobile ? 'h6' : 'h5') as 'h6' | 'h5',
      titleFontSize: isMobile ? '1.1rem' : '1.25rem',
      subheaderVariant: (isMobile ? 'body2' : 'body1') as 'body2' | 'body1',
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
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [mobilePage, setMobilePage] = useState<number>(0);
  const [mobilePageSize, setMobilePageSize] = useState<number>(5);
  const [checkInDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classroomDropdownOpen, setClassroomDropdownOpen] = useState<boolean>(false);

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
  const [hasSavedCheckIn, setHasSavedCheckIn] = useState<boolean>(false);

  // Fetch check-in report for current date and classroom
  const { data: checkInReport } = useCheckInReports({
    teacherId: auth.user?.teacher?.id,
    classroomId: defaultClassroom?.id,
    date: checkInDate,
  });

  // Initialize classroom data from query
  useEffect(() => {
    if (classroomLoading) return;
    
    if (classroomError) {
      console.error('Error loading classrooms:', classroomError);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลห้องเรียน');
      return;
    }

    if (!classroomData) {
      console.log('No classroom data available');
      return;
    }

    console.log('classroomData:', classroomData);
    
    // Handle nested data structure: { data: { data: { classrooms: [...] } } }
    let actualData = classroomData;
    if (classroomData?.data) {
      actualData = classroomData.data;
      // If still nested, go one level deeper
      if (actualData?.data) {
        actualData = actualData.data;
      }
    }
    
    // Access classrooms from the correct level
    const classrooms = actualData?.classrooms || [];
    
    if (!classrooms || !classrooms.length) {
      console.log('No classrooms found:', { 
        actualData, 
        hasClassrooms: !!classrooms, 
        length: classrooms?.length,
        teacherId: auth.user?.teacher?.id 
      });
      
      // Reset states when no classrooms found
      setClassrooms([]);
      setCurrentStudents([]);
      setDefaultClassroom(null);
      
      // Only show toast if we have data but no classrooms (not on initial load)
      if (actualData && classrooms && classrooms.length === 0) {
        toast.error('คุณยังไม่มีห้องเรียนที่ได้รับมอบหมาย กรุณาติดต่อผู้ดูแลระบบ');
      }
      return;
    }

    const [classroom] = classrooms;

    if (!classroom) {
      return;
    }

    if (!classroom.students || classroom.students.length === 0) {
      setDefaultClassroom(classroom);
      setClassrooms(classrooms);
      setCurrentStudents([]);
      setPageSize(10);
      setCurrentPage(0);
      setMobilePage(0);
    } else {
      const studentCount = classroom.students?.length || 0;
      setDefaultClassroom(classroom);
      setClassrooms(classrooms);
      setCurrentStudents(classroom.students || []);
      // Ensure pageSize is in pageSizeOptions [5, 10, 25, 50, 100]
      const validPageSizes = [5, 10, 25, 50, 100];
      const calculatedSize = studentCount > 0 ? Math.min(studentCount, 100) : 10;
      const closestSize = validPageSizes.find(size => size >= calculatedSize) || validPageSizes[validPageSizes.length - 1];
      setPageSize(Math.min(closestSize, studentCount > 0 ? studentCount : 10));
      setCurrentPage(0);
      setMobilePage(0);
    }
  }, [classroomData, classroomLoading, classroomError, auth.user?.teacher?.id]);

  // Load saved check-in status when report data is available
  useEffect(() => {
    if (!checkInReport || !defaultClassroom?.id) {
      setHasSavedCheckIn(false);
      return;
    }

    // Handle nested data structure
    const reportData = checkInReport?.data || checkInReport;
    
    // Check if there's saved check-in data
    const hasData = reportData && (
      (Array.isArray(reportData.present) && reportData.present.length > 0) ||
      (Array.isArray(reportData.absent) && reportData.absent.length > 0) ||
      (Array.isArray(reportData.late) && reportData.late.length > 0) ||
      (Array.isArray(reportData.leave) && reportData.leave.length > 0) ||
      (Array.isArray(reportData.internship) && reportData.internship.length > 0)
    );
    
    if (hasData) {
      setHasSavedCheckIn(true);
      // Set saved check-in status
      setIsPresentCheck(reportData.present || []);
      setIsAbsentCheck(reportData.absent || []);
      setIsLateCheck(reportData.late || []);
      setIsLeaveCheck(reportData.leave || []);
      setIsInternshipCheck(reportData.internship || []);
      
      // Update check-all states based on saved data
      const totalStudents = currentStudents?.length || 0;
      if (totalStudents > 0) {
        setIsPresentCheckAll((reportData.present || []).length === totalStudents);
        setIsAbsentCheckAll((reportData.absent || []).length === totalStudents);
        setIsLateCheckAll((reportData.late || []).length === totalStudents);
        setIsLeaveCheckAll((reportData.leave || []).length === totalStudents);
        setIsInternshipCheckAll((reportData.internship || []).length === totalStudents);
      }
    } else {
      setHasSavedCheckIn(false);
    }
  }, [checkInReport, defaultClassroom?.id, currentStudents?.length]);

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
      // Reset saved check-in status when changing classroom
      setHasSavedCheckIn(false);
      // Ensure pageSize is in pageSizeOptions [5, 10, 25, 50, 100]
      const studentCount = classroomObj.students?.length || 0;
      const validPageSizes = [5, 10, 25, 50, 100];
      const calculatedSize = studentCount > 0 ? Math.min(studentCount, 100) : 5;
      const closestSize = validPageSizes.find(size => size >= calculatedSize) || validPageSizes[0];
      setPageSize(Math.min(closestSize, studentCount > 0 ? studentCount : 5));
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

  const handleSaveCheckIn = () => {
    if (!auth.user?.teacher?.id || !defaultClassroom?.id) {
      toast.error('กรุณาเลือกห้องเรียนและเข้าสู่ระบบ');
      return;
    }

    // Convert checkInDate string to Date object for backend
    const checkInDateObj = checkInDate ? new Date(checkInDate) : new Date();
    
    const checkInData = {
      teacherId: auth.user.teacher.id,
      classroomId: defaultClassroom.id,
      checkInDate: checkInDateObj.toISOString(),
      present: isPresentCheck || [],
      absent: isAbsentCheck || [],
      late: isLateCheck || [],
      leave: isLeaveCheck || [],
      internship: isInternshipCheck || [],
    };

    console.log('Check-in Data:', checkInData);

    saveCheckIn(checkInData, {
      onSuccess: () => {
        // Mark as saved - React Query will refresh the data
        setHasSavedCheckIn(true);
        toast.success('บันทึกข้อมูลการเช็คชื่อเรียบร้อยแล้ว');
      },
      onError: (error: any) => {
        console.error('Error saving check-in data:', error);
        const errorMessage = error?.response?.data?.message 
          || error?.message 
          || 'ไม่สามารถบันทึกข้อมูลการเช็คชื่อได้';
        toast.error(errorMessage);
      },
    });
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

  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    setCurrentPage(model.page);
    setPageSize(model.pageSize);
  };

  const getStudentStatus = (studentId: any) => {
    if (isPresentCheck.includes(studentId)) return { status: 'มาเรียน', color: 'success' as const };
    if (isAbsentCheck.includes(studentId)) return { status: 'ขาดเรียน', color: 'error' as const };
    if (isLateCheck.includes(studentId)) return { status: 'มาสาย', color: 'warning' as const };
    if (isLeaveCheck.includes(studentId)) return { status: 'ลา', color: 'info' as const };
    if (isInternshipCheck.includes(studentId)) return { status: 'ฝึกงาน', color: 'secondary' as const };
    return { status: 'ยังไม่เช็ค', color: 'default' as const };
  };

  return {
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
    handleMobilePageChange,
    handleMobilePageSizeChange,
    handlePaginationModelChange,
    getPaginatedStudents,
    getTotalMobilePages,
    getStudentStatus,
    onHandleToggle,
  };
};

