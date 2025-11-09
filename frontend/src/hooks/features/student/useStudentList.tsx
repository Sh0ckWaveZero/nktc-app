import { useCallback, useEffect, useState, useDeferredValue } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { useClassroomStore, useStudentStore } from '@/store/index';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { shallow } from 'zustand/shallow';
import { toast } from 'react-toastify';

interface SearchValue {
  fullName: string;
  studentId: string;
}

interface UseStudentListReturn {
  // Classroom state
  classrooms: any[];
  initClassroom: any | null;
  currentClassroomId: string | null;
  loadingClassroom: boolean;

  // Student state
  students: any[];
  loadingStudent: boolean;
  currentStudent: any | null;
  searchValue: SearchValue;
  deferredSearchValue: SearchValue;

  // Delete dialog state
  openDeletedConfirm: boolean;
  deletedStudent: any | null;

  // Pagination
  pageSize: number;

  // Handlers
  handleChangeClassroom: (e: SelectChangeEvent, value: any) => void;
  handleChangeFullName: (e: any, newValue: any) => void;
  handleSearchChange: (event: any, value: any, reason: any) => void;
  handleStudentId: (value: any) => void;
  handleDeleteClick: (student: any) => void;
  handleDeleteConfirm: (event: any) => Promise<void>;
  handleDeleteCancel: () => void;
  setPageSize: (size: number) => void;
}

export const useStudentList = (): UseStudentListReturn => {
  // Hooks
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const classroom = searchParams.get('classroom');

  // Zustand stores
  const { fetchStudentsWithParams, removeStudents } = useStudentStore(
    (state: any) => ({
      fetchStudentsWithParams: state.fetchStudentsWithParams,
      removeStudents: state.removeStudents,
    }),
    shallow,
  );
  const { fetchClassroom } = useClassroomStore((state) => ({ fetchClassroom: state.fetchClassroom }), shallow);

  // State - Classroom
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [initClassroom, setInitClassroom] = useState<any | null>(null);
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(null);
  const [loadingClassroom, setLoadingClassroom] = useState<boolean>(false);

  // State - Students
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<any | null>(null);
  const [searchValue, setSearchValue] = useState<SearchValue>({ fullName: '', studentId: '' });
  const deferredSearchValue = useDeferredValue(searchValue);

  // State - Delete Dialog
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState<boolean>(false);
  const [deletedStudent, setDeletedStudent] = useState<any | null>(null);

  // State - Pagination
  const [pageSize, setPageSize] = useState<number>(10);

  // Effect: Fetch classrooms on mount and when user/classroom params change
  useEffect(() => {
    let isMounted = true;

    const loadClassrooms = async () => {
      setLoadingClassroom(true);
      try {
        const res = await fetchClassroom();

        if (!isMounted) return;

        if (!res || !Array.isArray(res)) {
          setClassrooms([]);
          setLoadingClassroom(false);
          return;
        }

        if (user?.role?.toLowerCase() === 'admin') {
          setClassrooms(res);
          if (classroom) {
            const filteredClassroom = res.filter((item: any) => item.id === classroom);
            setInitClassroom(filteredClassroom[0] || null);
            setCurrentClassroomId(filteredClassroom[0]?.id || null);
          } else {
            setInitClassroom(res[0] || null);
            setCurrentClassroomId(res[0]?.id || null);
          }
        } else {
          let teacherClassrooms = res;
          if (user?.teacherOnClassroom && user.teacherOnClassroom.length > 0) {
            teacherClassrooms = res.filter((item: any) => user.teacherOnClassroom.includes(item.id));
          }
          setClassrooms(teacherClassrooms);

          if (classroom) {
            const currentQueryClassroom = teacherClassrooms.filter((item: any) => item.id === classroom);
            setInitClassroom(currentQueryClassroom[0] || null);
            setCurrentClassroomId(currentQueryClassroom[0]?.id || null);
          } else {
            if (teacherClassrooms.length > 0) {
              setInitClassroom(teacherClassrooms[0] || null);
              setCurrentClassroomId(teacherClassrooms[0]?.id || null);
            } else {
              setInitClassroom(null);
              setCurrentClassroomId(null);
            }
          }
        }
        setLoadingClassroom(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching classrooms:', error);
        setClassrooms([]);
        setLoadingClassroom(false);
      }
    };

    loadClassrooms();

    return () => {
      isMounted = false;
    };
  }, [fetchClassroom, user, classroom]);

  // Effect: Fetch students whenever classroom or search changes
  useEffect(() => {
    if (!currentClassroomId) return;

    let isMounted = true;

    const loadStudents = async () => {
      setLoadingStudent(true);
      try {
        const query = {
          classroomId: currentClassroomId,
          search: deferredSearchValue,
        };

        const res = await fetchStudentsWithParams(query);
        if (!isMounted) return;

        const data = res || [];
        setStudents(data);
        setLoadingStudent(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching students:', error);
        setStudents([]);
        setLoadingStudent(false);
      }
    };

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, [currentClassroomId, deferredSearchValue, fetchStudentsWithParams]);

  // Handler: Change classroom
  const handleChangeClassroom = useCallback((e: SelectChangeEvent, value: any) => {
    e.preventDefault();
    setCurrentClassroomId(value?.id);
    setInitClassroom(value);
  }, []);

  // Handler: Change student full name
  const handleChangeFullName = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setCurrentStudent(newValue || null);

      if (newValue && newValue.account) {
        const firstName = newValue.account.firstName || '';
        const lastName = newValue.account.lastName || '';
        const fullNameWithoutTitle = `${firstName} ${lastName}`.trim();
        setSearchValue({ ...searchValue, fullName: fullNameWithoutTitle });
      } else if (!newValue) {
        setSearchValue({ ...searchValue, fullName: '' });
      }
    },
    [searchValue],
  );

  // Handler: Search change
  const handleSearchChange = useCallback(
    (event: any, value: any, reason: any) => {
      let cleanedValue = value;
      if (value && typeof value === 'string') {
        const titlePrefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง', 'ด.ช.', 'ด.ญ.'];
        for (const prefix of titlePrefixes) {
          if (value.startsWith(prefix)) {
            cleanedValue = value.substring(prefix.length).trim();
            break;
          }
        }
      }
      setSearchValue({ ...searchValue, fullName: cleanedValue });
    },
    [searchValue],
  );

  // Handler: Student ID change
  const handleStudentId = useCallback(
    (value: any) => {
      setSearchValue({ ...searchValue, studentId: value });
    },
    [searchValue],
  );

  // Handler: Delete click
  const handleDeleteClick = useCallback((student: any) => {
    setOpenDeletedConfirm(true);
    setDeletedStudent(student);
  }, []);

  // Handler: Delete confirm
  const handleDeleteConfirm = useCallback(
    async (event: any) => {
      event.stopPropagation();
      setOpenDeletedConfirm(false);
      setStudents([]);
      setLoadingStudent(true);

      const toastId = toast.info('กำลังลบข้อมูล...', {
        autoClose: false,
        hideProgressBar: true,
      });
      try {
        const res = await removeStudents(deletedStudent.id);
        if (res?.status === 204) {
          toast.dismiss(toastId);
          toast.success('ลบข้อมูลสำเร็จ');
        } else {
          toast.dismiss(toastId);
          toast.error(res?.response?.data.error || 'เกิดข้อผิดพลาด');
        }

        const updatedStudents = await fetchStudentsWithParams(currentClassroomId);
        setStudents(updatedStudents || []);
        setLoadingStudent(false);
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.dismiss(toastId);
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
        setLoadingStudent(false);
      }
    },
    [deletedStudent, currentClassroomId, removeStudents, fetchStudentsWithParams],
  );

  // Handler: Delete cancel
  const handleDeleteCancel = useCallback(() => {
    setOpenDeletedConfirm(false);
    setDeletedStudent(null);
  }, []);

  return {
    // Classroom state
    classrooms,
    initClassroom,
    currentClassroomId,
    loadingClassroom,

    // Student state
    students,
    loadingStudent,
    currentStudent,
    searchValue,
    deferredSearchValue,

    // Delete dialog state
    openDeletedConfirm,
    deletedStudent,

    // Pagination
    pageSize,

    // Handlers
    handleChangeClassroom,
    handleChangeFullName,
    handleSearchChange,
    handleStudentId,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    setPageSize,
  };
};
