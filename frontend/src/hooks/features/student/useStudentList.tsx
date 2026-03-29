import { useCallback, useEffect, useMemo, useState, useDeferredValue } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useClassrooms } from '@/hooks/queries/useClassrooms';
import { useStudentsWithParams, useDeleteStudent } from '@/hooks/queries/useStudents';

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
  handleDeleteConfirm: (event: any) => void;
  handleDeleteCancel: () => void;
  setPageSize: (size: number) => void;
}

export const useStudentList = (): UseStudentListReturn => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const classroom = searchParams.get('classroom');

  // ─── React Query ─────────────────────────────────────────────────────────────

  const { data: allClassrooms = [], isLoading: loadingClassroom } = useClassrooms();
  const { mutate: deleteStudent } = useDeleteStudent();

  // ─── UI State ────────────────────────────────────────────────────────────────

  const [initClassroom, setInitClassroom] = useState<any | null>(null);
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(null);
  const [currentStudent, setCurrentStudent] = useState<any | null>(null);
  const [searchValue, setSearchValue] = useState<SearchValue>({ fullName: '', studentId: '' });
  const deferredSearchValue = useDeferredValue(searchValue);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState(false);
  const [deletedStudent, setDeletedStudent] = useState<any | null>(null);
  const [pageSize, setPageSize] = useState(10);

  // ─── Derived classrooms (filter by teacher role) ─────────────────────────────

  const classrooms = useMemo(() => {
    if (!allClassrooms.length) return [];
    if (user?.role?.toLowerCase() === 'admin') return allClassrooms;
    if (user && user.teacherOnClassroom?.length > 0) {
      return allClassrooms.filter((item: any) => user.teacherOnClassroom.includes(item.id));
    }
    return allClassrooms;
  }, [allClassrooms, user]);

  // ─── Set initial classroom once data loads ────────────────────────────────────

  useEffect(() => {
    if (!classrooms.length || currentClassroomId) return;
    const target = classroom
      ? (classrooms.find((item: any) => item.id === classroom) ?? classrooms[0])
      : classrooms[0];
    setInitClassroom(target ?? null);
    setCurrentClassroomId(target?.id ?? null);
  }, [classrooms, classroom, currentClassroomId]);

  // ─── Students via React Query ─────────────────────────────────────────────────

  const { data: students = [], isFetching: loadingStudent } = useStudentsWithParams({
    classroomId: currentClassroomId,
    search: deferredSearchValue,
  });

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleChangeClassroom = useCallback((e: SelectChangeEvent, value: any) => {
    e.preventDefault();
    setCurrentClassroomId(value?.id);
    setInitClassroom(value);
  }, []);

  const handleChangeFullName = useCallback((e: any, newValue: any) => {
    e.preventDefault();
    setCurrentStudent(newValue || null);
    const account = newValue?.user?.account || newValue?.account;
    if (account) {
      const { firstName = '', lastName = '' } = account;
      setSearchValue((prev) => ({ ...prev, fullName: `${firstName} ${lastName}`.trim() }));
    } else if (!newValue) {
      setSearchValue((prev) => ({ ...prev, fullName: '' }));
    }
  }, []);

  const handleSearchChange = useCallback((_event: any, value: any, _reason: any) => {
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
    setSearchValue((prev) => ({ ...prev, fullName: cleanedValue }));
  }, []);

  const handleStudentId = useCallback((value: any) => {
    setSearchValue((prev) => ({ ...prev, studentId: value }));
  }, []);

  const handleDeleteClick = useCallback((student: any) => {
    setOpenDeletedConfirm(true);
    setDeletedStudent(student);
  }, []);

  const handleDeleteConfirm = useCallback(
    (event: any) => {
      event.stopPropagation();
      setOpenDeletedConfirm(false);
      const toastId = toast.info('กำลังลบข้อมูล...', { autoClose: false, hideProgressBar: true });
      deleteStudent(deletedStudent.id, {
        onSuccess: (res: any) => {
          toast.dismiss(toastId);
          if (res?.status === 204) {
            toast.success('ลบข้อมูลสำเร็จ');
          } else {
            toast.error(res?.response?.data?.error || 'เกิดข้อผิดพลาด');
          }
        },
        onError: () => {
          toast.dismiss(toastId);
          toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
        },
      });
    },
    [deletedStudent, deleteStudent],
  );

  const handleDeleteCancel = useCallback(() => {
    setOpenDeletedConfirm(false);
    setDeletedStudent(null);
  }, []);

  return {
    classrooms,
    initClassroom,
    currentClassroomId,
    loadingClassroom,
    students,
    loadingStudent,
    currentStudent,
    searchValue,
    openDeletedConfirm,
    deletedStudent,
    pageSize,
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
