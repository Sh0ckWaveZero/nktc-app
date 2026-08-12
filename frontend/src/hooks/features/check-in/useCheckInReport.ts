import { useState, useEffect, useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import {
  useTeacherClassroomsAndStudents,
  useSaveCheckIn,
  useDeleteCheckIn,
  useCheckInReports,
} from '@/hooks/queries/useCheckIn';
import { toApiDate } from '@/utils/datetime';
import { sortClassroomStudentsByStudentId, sortStudentsByStudentId } from '@/utils/student-sort';

const MOBILE_PAGE_SIZE = 2;

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
  mobileStudentFilter: 'pending' | 'all';
  mobilePendingStudents: any[];
  mobileFilteredStudentsCount: number;
  mobilePendingStudentsCount: number;

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
  selectedDate: Date | null;

  // Loading states
  isSaving: boolean;
  isResetting: boolean;

  // Handlers
  handleSelectChange: (event: any) => void;
  handleCellClick: (params: any) => void;
  handleColumnHeaderClick: (params: any) => void;
  handleSaveCheckIn: () => void;
  handleResetCheckIn: () => void;
  handleDateChange: (date: Date | null) => void;
  handleMobilePageChange: (newPage: number) => void;
  handleMobileStudentFilterChange: (filter: 'pending' | 'all') => void;
  handlePaginationModelChange: (model: { page: number; pageSize: number }) => void;
  getPaginatedStudents: () => any[];
  getTotalMobilePages: () => number;
  getStudentStatus: (studentId: any) => {
    status: string;
    color: 'success' | 'error' | 'warning' | 'info' | 'secondary' | 'default';
  };
  onHandleToggle: (action: string, param: StudentToggleParam) => void;
}

type StudentToggleParam = string | { id: string };

const getStudentId = (param: StudentToggleParam): string => (typeof param === 'string' ? param : param.id);

const onSetToggle = (prevSelection: string[], param: StudentToggleParam): string[] => {
  const studentId = getStudentId(param);
  const index = prevSelection.indexOf(studentId);

  if (index === -1) return [...prevSelection, studentId];

  return [...prevSelection.slice(0, index), ...prevSelection.slice(index + 1)];
};

const onRemoveToggle = (prevSelection: string[], param: StudentToggleParam): string[] => {
  const studentId = getStudentId(param);

  return prevSelection.filter((selectedStudentId) => selectedStudentId !== studentId);
};

// Flatten nested student data from API: student.user.account.* → student.*
const flattenStudent = (student: any) => {
  const account = student?.user?.account || {};
  return {
    ...student,
    firstName: account.firstName ?? student.firstName,
    lastName: account.lastName ?? student.lastName,
    title: account.title ?? student.title,
    avatar: account.avatar ?? student.avatar,
  };
};

export const useCheckInReport = (): UseCheckInReportReturn => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // React Query hooks
  const {
    data: classroomData,
    isLoading: classroomLoading,
    error: classroomError,
  } = useTeacherClassroomsAndStudents(auth.user?.teacher?.id || '');
  const { mutate: saveCheckIn, isPending: isSaving } = useSaveCheckIn();
  const { mutate: deleteCheckIn, isPending: isResetting } = useDeleteCheckIn();

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
  const mobilePageSize = MOBILE_PAGE_SIZE;
  const [mobileStudentFilter, setMobileStudentFilter] = useState<'pending' | 'all'>('pending');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const checkInDate = useMemo(() => toApiDate(selectedDate ?? new Date()), [selectedDate]);
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
  const [savedCheckInId, setSavedCheckInId] = useState<string | null>(null);

  const checkedStudentIds = useMemo(
    () => new Set<string>([...isPresentCheck, ...isAbsentCheck, ...isLateCheck, ...isLeaveCheck, ...isInternshipCheck]),
    [isPresentCheck, isAbsentCheck, isLateCheck, isLeaveCheck, isInternshipCheck],
  );
  const pendingMobileStudents = useMemo(
    () => currentStudents.filter((student: any) => !checkedStudentIds.has(student.id)),
    [checkedStudentIds, currentStudents],
  );
  const filteredMobileStudents = mobileStudentFilter === 'pending' ? pendingMobileStudents : currentStudents;

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

    // Handle nested data structure: { data: { data: { classrooms: [...] } } }
    let actualData = classroomData;
    if (classroomData?.data) {
      actualData = classroomData.data;
      // If still nested, go one level deeper
      if (actualData?.data) {
        actualData = actualData.data;
      }
    }

    // Backend returns a plain array directly; also support { classrooms: [...] } wrapper
    const classrooms = sortClassroomStudentsByStudentId(
      Array.isArray(actualData) ? actualData : actualData?.classrooms || [],
    );

    if (!classrooms || !classrooms.length) {
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
      setCurrentStudents(sortStudentsByStudentId(classroom.students).map(flattenStudent));
      // Ensure pageSize is in pageSizeOptions [5, 10, 25, 50, 100]
      const validPageSizes = [5, 10, 25, 50, 100];
      const calculatedSize = studentCount > 0 ? Math.min(studentCount, 100) : 10;
      const closestSize =
        validPageSizes.find((size) => size >= calculatedSize) || validPageSizes[validPageSizes.length - 1];
      setPageSize(Math.min(closestSize, studentCount > 0 ? studentCount : 10));
      setCurrentPage(0);
      setMobilePage(0);
    }
  }, [classroomData, classroomLoading, classroomError, auth.user?.teacher?.id]);

  // Load saved check-in status when report data is available for the selected date.
  // Avoid depending on currentStudents length because it can re-run and reset state at the wrong time.
  useEffect(() => {
    if (!defaultClassroom?.id) {
      setHasSavedCheckIn(false);
      setSavedCheckInId(null);
      return;
    }

    // checkInReport เป็น null/undefined = ยังไม่มีข้อมูลวันนี้
    if (!checkInReport) {
      setHasSavedCheckIn(false);
      setSavedCheckInId(null);
      setIsPresentCheck([]);
      setIsAbsentCheck([]);
      setIsLateCheck([]);
      setIsLeaveCheck([]);
      setIsInternshipCheck([]);
      setIsPresentCheckAll(false);
      setIsAbsentCheckAll(false);
      setIsLateCheckAll(false);
      setIsLeaveCheckAll(false);
      setIsInternshipCheckAll(false);
      return;
    }

    // Normalize nested structure: { data: { present: [] } } หรือ { present: [] }
    const reportData = checkInReport?.data ?? checkInReport;

    // Verify the record date matches the selected date.
    // The backend may return a stale record if the date filter is not applied server-side.
    const recordDate = reportData?.checkInDate ? toApiDate(reportData.checkInDate) : null;
    const isSelectedDate = recordDate === checkInDate;

    const present = Array.isArray(reportData?.present) ? reportData.present : [];
    const absent = Array.isArray(reportData?.absent) ? reportData.absent : [];
    const late = Array.isArray(reportData?.late) ? reportData.late : [];
    const leave = Array.isArray(reportData?.leave) ? reportData.leave : [];
    const internship = Array.isArray(reportData?.internship) ? reportData.internship : [];

    // Only treat the page as saved when the returned record belongs to the selected date.
    const hasData =
      isSelectedDate && present.length + absent.length + late.length + leave.length + internship.length > 0;

    if (hasData) {
      setHasSavedCheckIn(true);
      setSavedCheckInId(typeof reportData?.id === 'string' ? reportData.id : null);
      setIsPresentCheck(present);
      setIsAbsentCheck(absent);
      setIsLateCheck(late);
      setIsLeaveCheck(leave);
      setIsInternshipCheck(internship);

      // อัปเดต check-all โดยใช้ค่า currentStudents ณ ตอนนั้น (ไม่ใช้ใน dependency)
      setIsPresentCheckAll((prev) => prev); // จะถูกคำนวณใหม่ถ้า students โหลดทีหลัง
      setIsAbsentCheckAll((prev) => prev);
      setIsLateCheckAll((prev) => prev);
      setIsLeaveCheckAll((prev) => prev);
      setIsInternshipCheckAll((prev) => prev);
    } else {
      setHasSavedCheckIn(false);
      setSavedCheckInId(null);
    }
  }, [checkInReport, defaultClassroom?.id, checkInDate]);

  // Handle classroom selection change
  const handleSelectChange = async (event: any) => {
    event.preventDefault();
    const {
      target: { value },
    } = event;
    const classroomObj: any = classrooms.find((item: any) => item.name === value);

    if (classroomObj) {
      setCurrentStudents(sortStudentsByStudentId(classroomObj.students || []).map(flattenStudent));
      setDefaultClassroom(classroomObj);
      // Reset saved check-in status when changing classroom
      setHasSavedCheckIn(false);
      setSavedCheckInId(null);
      // Ensure pageSize is in pageSizeOptions [5, 10, 25, 50, 100]
      const studentCount = classroomObj.students?.length || 0;
      const validPageSizes = [5, 10, 25, 50, 100];
      const calculatedSize = studentCount > 0 ? Math.min(studentCount, 100) : 5;
      const closestSize = validPageSizes.find((size) => size >= calculatedSize) || validPageSizes[0];
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
  const onHandleToggle = (action: string, param: StudentToggleParam): void => {
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

    if (isMobile && mobileStudentFilter === 'pending' && action) {
      const remainingStudentsCount = Math.max(filteredMobileStudents.length - 1, 0);
      const lastPage = Math.max(Math.ceil(remainingStudentsCount / mobilePageSize) - 1, 0);
      setMobilePage((previousPage) => Math.min(previousPage, lastPage));
    }
  };

  const handleTogglePresent = (param: StudentToggleParam): void => {
    setIsPresentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleAbsent = (param: StudentToggleParam): void => {
    setIsAbsentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLate = (param: StudentToggleParam): void => {
    setIsLateCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLeave = (param: StudentToggleParam): void => {
    setIsLeaveCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleInternship = (param: StudentToggleParam): void => {
    setIsInternshipCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const onRemoveToggleOthers = (action: string, param: StudentToggleParam): void => {
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
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        onHandleInternshipChecked(param);
        break;
    }
  };

  const onHandlePresentChecked = (param: StudentToggleParam): void => {
    if (isPresentCheck.includes(getStudentId(param))) {
      setIsPresentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleAbsentChecked = (param: StudentToggleParam): void => {
    if (isAbsentCheck.includes(getStudentId(param))) {
      setIsAbsentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLateChecked = (param: StudentToggleParam): void => {
    if (isLateCheck.includes(getStudentId(param))) {
      setIsLateCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLeaveChecked = (param: StudentToggleParam): void => {
    if (isLeaveCheck.includes(getStudentId(param))) {
      setIsLeaveCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleInternshipChecked = (param: StudentToggleParam): void => {
    if (isInternshipCheck.includes(getStudentId(param))) {
      setIsInternshipCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
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

  const handleDateChange = (date: Date | null): void => {
    setSelectedDate(date ?? new Date());
    setHasSavedCheckIn(false);
    setSavedCheckInId(null);
    onClearAll('');
  };

  const handleSaveCheckIn = () => {
    if (!auth.user?.teacher?.id || !defaultClassroom?.id) {
      toast.error('กรุณาเลือกห้องเรียนและเข้าสู่ระบบ');
      return;
    }

    const checkInData = {
      teacherId: auth.user.teacher.id,
      classroomId: defaultClassroom.id,
      checkInDate,
      present: isPresentCheck || [],
      absent: isAbsentCheck || [],
      late: isLateCheck || [],
      leave: isLeaveCheck || [],
      internship: isInternshipCheck || [],
    };
    saveCheckIn(checkInData, {
      onSuccess: (savedReport) => {
        // Mark as saved - React Query will refresh the data
        setHasSavedCheckIn(true);
        const reportData = savedReport?.data ?? savedReport;
        setSavedCheckInId(typeof reportData?.id === 'string' ? reportData.id : null);
        toast.success('บันทึกข้อมูลการเช็คชื่อเรียบร้อยแล้ว');
      },
      onError: (error: any) => {
        console.error('Error saving check-in data:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'ไม่สามารถบันทึกข้อมูลการเช็คชื่อได้';
        toast.error(errorMessage);
      },
    });
  };

  const handleResetCheckIn = (): void => {
    if (process.env.NODE_ENV !== 'development') return;

    if (!savedCheckInId) {
      toast.error('ไม่พบข้อมูลการเช็คชื่อที่ต้องการ Reset');
      return;
    }

    deleteCheckIn(savedCheckInId, {
      onSuccess: () => {
        setHasSavedCheckIn(false);
        setSavedCheckInId(null);
        onClearAll('');
        setMobileStudentFilter('pending');
        setMobilePage(0);
        setCurrentPage(0);
        toast.success('Reset ข้อมูลการเช็คชื่อสำหรับทดสอบแล้ว');
      },
      onError: (error: any) => {
        console.error('Error resetting check-in data:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'ไม่สามารถ Reset ข้อมูลการเช็คชื่อได้';
        toast.error(errorMessage);
      },
    });
  };

  // Mobile pagination functions
  const getPaginatedStudents = () => {
    const lastPage = Math.max(Math.ceil(filteredMobileStudents.length / mobilePageSize) - 1, 0);
    const safePage = Math.min(mobilePage, lastPage);
    const startIndex = safePage * mobilePageSize;
    const endIndex = startIndex + mobilePageSize;
    return filteredMobileStudents.slice(startIndex, endIndex);
  };

  const handleMobilePageChange = (newPage: number) => {
    setMobilePage(newPage);
    // Scroll to top of the list when changing page
    const scrollContainer = document.getElementById('checkin-mobile-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMobileStudentFilterChange = (filter: 'pending' | 'all') => {
    setMobileStudentFilter(filter);
    setMobilePage(0);
  };

  const getTotalMobilePages = () => {
    return Math.ceil(filteredMobileStudents.length / mobilePageSize);
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
    mobileStudentFilter,
    mobilePendingStudents: pendingMobileStudents,
    mobileFilteredStudentsCount: filteredMobileStudents.length,
    mobilePendingStudentsCount: pendingMobileStudents.length,
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
    getStudentStatus,
    onHandleToggle,
  };
};
