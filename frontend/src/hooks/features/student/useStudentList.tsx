import { useCallback, useEffect, useMemo, useState, useDeferredValue } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import httpClient from '@/@core/utils/http';
import { authConfig } from '@/configs/auth';
import { useClassrooms } from '@/hooks/queries/useClassrooms';
import {
  useStudentsWithParams,
  useDeleteStudent,
  useImportStudents,
  type StudentImportResult,
} from '@/hooks/queries/useStudents';

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
  isAdmin: boolean;

  // Student state
  students: any[];
  loadingStudent: boolean;
  currentStudent: any | null;
  searchValue: SearchValue;

  // Delete dialog state
  openDeletedConfirm: boolean;
  deletedStudent: any | null;

  // Import state
  openImportResultDialog: boolean;
  importResult: StudentImportResult | null;
  isImportingStudents: boolean;
  isDownloadingTemplate: boolean;
  isExportingStudents: boolean;

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
  handleImportStudents: (file: File | null) => Promise<void>;
  handleCloseImportResultDialog: () => void;
  handleDownloadTemplate: () => Promise<void>;
  handleExportStudents: () => Promise<void>;
  setPageSize: (size: number) => void;
}

const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;
const STUDENT_EXPORT_HEADERS = [
  'รหัสนักเรียน*',
  'คำนำหน้า',
  'ชื่อ',
  'นามสกุล',
  'รหัสห้องเรียน',
  'รหัสสาขา',
  'รหัสแผนก',
  'รหัสระดับ',
  'เบอร์โทร',
  'อีเมล',
] as const;

const convertFileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
        return;
      }

      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };

    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });

export const useStudentList = (): UseStudentListReturn => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const classroom = searchParams.get('classroom');

  // ─── React Query ─────────────────────────────────────────────────────────────

  const { data: allClassrooms = [], isLoading: loadingClassroom } = useClassrooms();
  const { mutate: deleteStudent } = useDeleteStudent();
  const { mutateAsync: importStudents, isPending: isImportingStudents } = useImportStudents();

  // ─── UI State ────────────────────────────────────────────────────────────────

  const [initClassroom, setInitClassroom] = useState<any | null>(null);
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(null);
  const [currentStudent, setCurrentStudent] = useState<any | null>(null);
  const [searchValue, setSearchValue] = useState<SearchValue>({ fullName: '', studentId: '' });
  const deferredSearchValue = useDeferredValue(searchValue);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState(false);
  const [deletedStudent, setDeletedStudent] = useState<any | null>(null);
  const [openImportResultDialog, setOpenImportResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<StudentImportResult | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isExportingStudents, setIsExportingStudents] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // ─── Derived classrooms (filter by teacher role) ─────────────────────────────

  const classrooms = useMemo(() => {
    if (!allClassrooms.length) return [];
    if (isAdmin) return allClassrooms;
    if (user && user.teacherOnClassroom?.length > 0) {
      return allClassrooms.filter((item: any) => user.teacherOnClassroom.includes(item.id));
    }
    return allClassrooms;
  }, [allClassrooms, isAdmin, user]);

  // ─── Set initial classroom once data loads ────────────────────────────────────

  useEffect(() => {
    if (!classrooms.length || currentClassroomId) return;
    const target = classroom ? (classrooms.find((item: any) => item.id === classroom) ?? classrooms[0]) : classrooms[0];
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

  const handleCloseImportResultDialog = useCallback(() => {
    setOpenImportResultDialog(false);
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    const toastId = toast.info('กำลังดาวน์โหลด template...', { autoClose: false, hideProgressBar: true });
    setIsDownloadingTemplate(true);

    try {
      const response = await httpClient.get(`${authConfig.studentEndpoint}/download-template`, {
        responseType: 'blob',
      });
      const contentType =
        response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'student_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success('ดาวน์โหลด template สำเร็จ');
    } catch {
      toast.dismiss(toastId);
      toast.error('ไม่สามารถดาวน์โหลด template ได้');
    } finally {
      setIsDownloadingTemplate(false);
    }
  }, []);

  const handleExportStudents = useCallback(async () => {
    if (!students.length) {
      toast.warn('ไม่มีข้อมูลนักเรียนสำหรับ export');
      return;
    }

    const toastId = toast.info('กำลังเตรียมไฟล์ export...', { autoClose: false, hideProgressBar: true });
    setIsExportingStudents(true);

    try {
      const XLSX = await import('xlsx');
      const rows = students.map((student: any) => {
        const account = student?.user?.account;
        const classroom = student?.classroom;
        const program = student?.program ?? classroom?.program;
        const department = student?.department ?? classroom?.department;
        const level = student?.level ?? classroom?.level;

        return {
          'รหัสนักเรียน*': student?.studentId ?? '',
          คำนำหน้า: account?.title ?? '',
          ชื่อ: account?.firstName ?? '',
          นามสกุล: account?.lastName ?? '',
          รหัสห้องเรียน: classroom?.classroomId ?? '',
          รหัสสาขา: program?.programId ?? '',
          รหัสแผนก: department?.departmentId ?? '',
          รหัสระดับ: level?.levelId ?? '',
          เบอร์โทร: account?.phone ?? '',
          อีเมล: student?.user?.email ?? '',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...STUDENT_EXPORT_HEADERS] });
      worksheet['!cols'] = STUDENT_EXPORT_HEADERS.map((header) => ({
        wch: header === 'อีเมล' ? 28 : header === 'รหัสนักเรียน*' ? 16 : 18,
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'นักเรียน');

      const formattedDate = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(/[: ]/g, '-');
      const classroomName = initClassroom?.name ? String(initClassroom.name).replace(/[\\/:*?"<>|]/g, '_') : 'students';

      XLSX.writeFile(workbook, `student_export_${classroomName}_${formattedDate}.xlsx`);

      toast.dismiss(toastId);
      toast.success(`export ข้อมูลนักเรียน ${rows.length} รายการสำเร็จ`);
    } catch {
      toast.dismiss(toastId);
      toast.error('ไม่สามารถ export ข้อมูลนักเรียนได้');
    } finally {
      setIsExportingStudents(false);
    }
  }, [initClassroom?.name, students]);

  const handleImportStudents = useCallback(
    async (file: File | null) => {
      if (!file) return;

      const isXlsxFile = file.name.toLowerCase().endsWith('.xlsx');

      if (!isXlsxFile) {
        toast.error('รองรับเฉพาะไฟล์ .xlsx เท่านั้น');
        return;
      }

      if (file.size > MAX_IMPORT_FILE_SIZE) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 5 MB');
        return;
      }

      const toastId = toast.info('กำลังนำเข้าข้อมูลนักเรียน...', {
        autoClose: false,
        hideProgressBar: true,
      });

      try {
        const base64File = await convertFileToBase64(file);
        const result = await importStudents({ file: base64File });

        setImportResult(result);
        setOpenImportResultDialog(true);
        toast.dismiss(toastId);

        if (result.total === 0 || result.imported === 0 || result.failed > 0) {
          toast.warn(result.message);
          return;
        }

        toast.success(result.message);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string; message?: string } } };

        toast.dismiss(toastId);
        toast.error(err?.response?.data?.error || err?.response?.data?.message || 'ไม่สามารถนำเข้าข้อมูลนักเรียนได้');
      }
    },
    [importStudents],
  );

  return {
    classrooms,
    initClassroom,
    currentClassroomId,
    loadingClassroom,
    isAdmin,
    students,
    loadingStudent,
    currentStudent,
    searchValue,
    openDeletedConfirm,
    deletedStudent,
    openImportResultDialog,
    importResult,
    isImportingStudents,
    isDownloadingTemplate,
    isExportingStudents,
    pageSize,
    handleChangeClassroom,
    handleChangeFullName,
    handleSearchChange,
    handleStudentId,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleImportStudents,
    handleCloseImportResultDialog,
    handleDownloadTemplate,
    handleExportStudents,
    setPageSize,
  };
};
