import { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import { useClassroomStore, useTeacherStore, useUserStore } from '@/store/index';
import { useEffectOnce } from '@/hooks/userCommon';
import { useResponsive } from '@/@core/hooks/useResponsive';
import { useAuth } from '@/hooks/useAuth';
import { shallow } from 'zustand/shallow';
import { toast } from 'react-toastify';
import { generateErrorMessages } from '@/utils/event';
import { isEmpty } from '@/@core/utils/utils';
import { Classroom } from '@/types/apps/teacherTypes';
import { ResetPasswordByAdminRequest } from '@/types/apps/userTypes';
import {
  Teacher,
  TeacherArray,
  extractTeacherArray,
  getClassroomDefaultValues,
  UpdateClassroomInfo,
  AddTeacherInfo,
  UpdateTeacherBody,
} from '../utils/teacherUtils';
import { ITEMS_PER_PAGE, SEARCH_DEBOUNCE_MS, INFINITE_SCROLL_LOAD_DELAY_MS } from '../constants';

export const useTeacherList = () => {
  // ** Local State
  const [searchValue, setSearchValue] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false);
  const [addClassroomOpen, setAddClassroomOpen] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<Teacher | null>(null);
  const deferredValue = useDeferredValue(searchValue);
  const [openDialogEdit, setOpenDialogEdit] = useState(false);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<TeacherArray>([]);
  const [isSubmittingClassroom, setIsSubmittingClassroom] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  
  // ** Infinite scroll state for mobile
  const [displayedTeachers, setDisplayedTeachers] = useState<TeacherArray>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ** Hooks
  const { user } = useAuth();
  const { isMobile } = useResponsive();

  const { resetPasswordByAdmin } = useUserStore(
    (state) => ({
      resetPasswordByAdmin: state.resetPasswordByAdmin,
    }),
    shallow,
  );

  const { addTeacher, removeTeacher, update, updateClassroom, fetchTeacher } = useTeacherStore(
    (state) => ({
      addTeacher: state.addTeacher,
      fetchTeacher: state.fetchTeacher,
      removeTeacher: state.removeTeacher,
      update: state.update,
      updateClassroom: state.updateClassroom,
    }),
    shallow,
  );

  const { classroom, fetchClassroom } = useClassroomStore(
    (state) => ({
      classroom: state.classroom,
      fetchClassroom: state.fetchClassroom,
    }),
    shallow,
  );

  useEffectOnce(() => {
    fetchClassroom();
  });

  // ** Fetch data on page load and when dependencies change
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      setIsLoadingTeachers(true);
      try {
        const res = await fetchTeacher({
          q: deferredValue,
        });
        
        if (isMounted) {
          const teacherArray = extractTeacherArray(res);
          setTeachers(teacherArray);
          // Reset pagination when data changes
          if (isMobile) {
            setCurrentPage(1);
            setDisplayedTeachers(teacherArray.slice(0, ITEMS_PER_PAGE));
          }
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        if (isMounted) {
          setTeachers([]);
          if (isMobile) {
            setDisplayedTeachers([]);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingTeachers(false);
        }
      }
    };

    // Debounce the search
    timeoutId = setTimeout(() => {
      fetchData();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [deferredValue, refreshTrigger, fetchTeacher, isMobile]);

  // ** Update displayed teachers when teachers data changes (for mobile)
  useEffect(() => {
    if (isMobile && teachers.length > 0) {
      const endIndex = currentPage * ITEMS_PER_PAGE;
      setDisplayedTeachers(teachers.slice(0, endIndex));
    } else if (!isMobile) {
      // Reset displayed teachers when switching to desktop
      setDisplayedTeachers([]);
      setCurrentPage(1);
    }
  }, [teachers, currentPage, isMobile]);

  // ** Memoized Values
  const defaultValue = useMemo(
    () => getClassroomDefaultValues(currentData, classroom),
    [currentData, classroom]
  );

  // ** Handlers
  const handleFilter = useCallback((val: string) => {
    setSearchValue(val);
  }, []);

  const toggleAddUserDrawer = useCallback(() => {
    setAddUserOpen((prev) => !prev);
  }, []);

  const toggleAddClassroomDrawer = useCallback(() => {
    setAddClassroomOpen((prev) => {
      if (prev) {
        setIsSubmittingClassroom(false);
      }
      return !prev;
    });
  }, []);

  const onSubmittedClassroom = useCallback(async (event: React.FormEvent, data: Classroom[]) => {
    event.preventDefault();
    
    if (!currentData) {
      toast.error('ไม่พบข้อมูลครู');
      return;
    }

    const classrooms = data.map((item: Classroom) => item.id || item.classroomId).filter(Boolean) as string[];
    const info: UpdateClassroomInfo = {
      id: currentData.id,
      classrooms,
      teacherInfo: currentData.teacherId,
    };

    setIsSubmittingClassroom(true);

    const toastId = toast.info('กำลังบันทึก...', {
      autoClose: false,
      hideProgressBar: true,
    });

    try {
      await updateClassroom(info);
      toast.dismiss(toastId);
      toast.success('บันทึกสำเร็จ');
      setRefreshTrigger((prev) => prev + 1);
      toggleAddClassroomDrawer();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('เกิดข้อผิดพลาด');
      console.error('Error updating classroom:', error);
    } finally {
      setIsSubmittingClassroom(false);
    }
  }, [currentData, updateClassroom, toggleAddClassroomDrawer]);

  const handleEdit = useCallback((data: Teacher) => {
    setCurrentTeacher(data);
    setOpenDialogEdit(true);
  }, []);

  const handleDelete = useCallback((data: Teacher) => {
    setCurrentTeacher(data);
    setOpenDialogDelete(true);
  }, []);

  const handleChangePassword = useCallback((data: Teacher) => {
    setCurrentTeacher(data);
    setOpenChangePassword(true);
  }, []);

  const onHandleEditClose = useCallback(() => {
    setOpenDialogEdit(false);
  }, []);

  const onHandleChangePasswordClose = useCallback(() => {
    setOpenChangePassword(false);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setOpenDialogDelete(false);
  }, []);

  const handleEditTeacher = useCallback(async (data: Teacher) => {
    if (!user?.id || !currentTeacher?.accountId) {
      toast.error('ข้อมูลไม่ครบถ้วน');
      return;
    }

    setOpenDialogEdit(false);
    const body: UpdateTeacherBody = {
      user: {
        id: user.id,
      },
      teacher: {
        ...data,
      },
      account: {
        id: currentTeacher.accountId,
      },
    };

    const toastId = toast.info('กำลังบันทึกข้อมูล...', {
      autoClose: false,
      hideProgressBar: true,
    });
    try {
      const res = await update(body);
      if (res?.name !== 'AxiosError') {
        toast.dismiss(toastId);
        toast.success('บันทึกข้อมูลสำเร็จ');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const { data: errorData } = res?.response || {};
        const message = generateErrorMessages[errorData?.message] || errorData?.message;
        toast.dismiss(toastId);
        toast.error(message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('เกิดข้อผิดพลาด');
    }
  }, [user, currentTeacher, update]);

  const handleChangePasswordTeacher = useCallback(async (data: Teacher & { password: string }) => {
    if (!user?.id) {
      toast.error('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    setOpenChangePassword(false);
    const body: ResetPasswordByAdminRequest = {
      teacher: {
        id: data.id,
      },
      newPassword: data.password,
    };

    const toastId = toast.info('กำลังเปลี่ยนรหัสผ่าน...', {
      autoClose: false,
      hideProgressBar: true,
    });
    try {
      const res = await resetPasswordByAdmin(body);
      if (res?.name !== 'AxiosError') {
        toast.dismiss(toastId);
        toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const { data: errorData } = res?.response || {};
        const message = generateErrorMessages[errorData?.message] || errorData?.message;
        toast.dismiss(toastId);
        toast.error(message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('เกิดข้อผิดพลาด');
    }
  }, [user, resetPasswordByAdmin]);

  const onHandleAddTeacher = useCallback(async (info: AddTeacherInfo) => {
    if (!user?.id) {
      toast.error('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    setAddUserOpen(false);

    const { fullName, ...rest } = info;
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const body: UpdateTeacherBody = {
      user: {
        id: user.id,
      },
      teacher: {
        ...rest,
        password: info.password, // Send plain password - backend will hash it
        firstName,
        lastName,
        role: 'Teacher',
        status: 'true',
      } as Partial<Teacher> as Teacher,
      account: {},
    };

    const toastId = toast.info('กำลังเพิ่มข้อมูลของครู/อาจารย์...', {
      autoClose: false,
      hideProgressBar: true,
    });
    try {
      const res = await addTeacher(body);
      if (res?.name !== 'AxiosError') {
        toast.dismiss(toastId);
        toast.success('เพิ่มข้อมูลสำเร็จ');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const { data: errorData } = res?.response || {};
        const message = generateErrorMessages[errorData?.message] || errorData?.message;
        toast.dismiss(toastId);
        toast.error(message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('เกิดข้อผิดพลาด');
    }
  }, [user, addTeacher]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!currentTeacher?.id) {
      toast.error('ไม่พบข้อมูลครู');
      return;
    }

    setOpenDialogDelete(false);

    const toastId = toast.info('กำลังลบข้อมูลของครู/อาจารย์...', {
      autoClose: false,
      hideProgressBar: true,
    });
    try {
      const res = await removeTeacher(currentTeacher.id);
      if (res?.name !== 'AxiosError') {
        toast.dismiss(toastId);
        toast.success('ลบข้อมูลสำเร็จ');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const { data: errorData } = res?.response || {};
        const message = generateErrorMessages[errorData?.message] || errorData?.message;
        toast.dismiss(toastId);
        toast.error(message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('เกิดข้อผิดพลาด');
    }
  }, [currentTeacher, removeTeacher]);

  const handleAddClassroom = useCallback((teacher: Teacher) => {
    setAddClassroomOpen(true);
    setCurrentData(teacher);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsLoadingMore(false);
      }, INFINITE_SCROLL_LOAD_DELAY_MS);
    }
  }, [isLoadingMore]);

  return {
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
  };
};

