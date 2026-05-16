import { useCallback, useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import httpClient from '@/@core/utils/http';
import { authConfig } from '@/configs/auth';
import { useClassrooms } from '@/hooks/queries/useClassrooms';
import {
  useStudentsWithParams,
  useDeleteStudent,
  useImportStudents,
  useGraduateStudent,
  useGraduateClassroom,
  usePromoteStudents,
  usePromotePreview,
  useDeleteAllClassroom,
  type StudentImportResult,
} from '@/hooks/queries/useStudents';

interface SearchValue {
  fullName: string;
  studentId: string;
  studentStatus: string;
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
  isDeleting: boolean;

  // Bulk delete dialog state
  openBulkDeleteConfirm: boolean;
  isDeletingAll: boolean;

  // Graduation dialog state
  openGraduationConfirm: boolean;
  graduationStudent: any | null;
  isGraduating: boolean;

  // Bulk graduation dialog state
  openBulkGraduationConfirm: boolean;
  isGraduatingClassroom: boolean;

  // Promotion dialog state
  openPromoteConfirm: boolean;
  promoteSource: any | null;
  promoteTarget: any | null;
  promotePreview: any | null;
  isLoadingPromotePreview: boolean;
  isPromoting: boolean;

  // Individual promotion dialog state
  openIndividualPromoteConfirm: boolean;
  promoteStudent: any | null;
  promoteStudentTarget: any | null;

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
  handleStatusChange: (status: string) => void;
  handleDeleteClick: (student: any) => void;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
  handleBulkDeleteClick: () => void;
  handleBulkDeleteConfirm: () => void;
  handleBulkDeleteCancel: () => void;
  handleGraduationClick: (student: any) => void;
  handleGraduationConfirm: (graduationDate: Date) => void;
  handleGraduationCancel: () => void;
  handleBulkGraduationClick: () => void;
  handleBulkGraduationConfirm: (graduationDate: Date) => void;
  handleBulkGraduationCancel: () => void;
  handlePromoteClick: () => void;
  handlePromoteSourceChange: (value: any) => void;
  handlePromoteTargetChange: (value: any) => void;
  handlePromoteConfirm: () => void;
  handlePromoteCancel: () => void;
  handleIndividualPromoteClick: (student: any) => void;
  handleIndividualPromoteTargetChange: (value: any) => void;
  handleIndividualPromoteConfirm: () => void;
  handleIndividualPromoteCancel: () => void;
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
  'สถานะนักเรียน',
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const classroom = searchParams.get('classroom');

  // ─── React Query ─────────────────────────────────────────────────────────────

  const { data: allClassrooms = [], isLoading: loadingClassroom } = useClassrooms();
  const { mutate: deleteStudent } = useDeleteStudent();
  const { mutate: deleteAllClassroom, isPending: isDeletingAll } = useDeleteAllClassroom();
  const { mutate: graduateStudent } = useGraduateStudent();
  const { mutate: graduateClassroom } = useGraduateClassroom();
  const { mutateAsync: importStudents, isPending: isImportingStudents } = useImportStudents();
  const { mutate: promoteStudents, isPending: isPromoting } = usePromoteStudents();

  // ─── UI State ────────────────────────────────────────────────────────────────

  const [initClassroom, setInitClassroom] = useState<any | null>(null);
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(null);
  const classroomInitialized = useRef(false);
  const [currentStudent, setCurrentStudent] = useState<any | null>(null);
  const [searchValue, setSearchValue] = useState<SearchValue>({ fullName: '', studentId: '', studentStatus: '' });
  const deferredSearchValue = useDeferredValue(searchValue);
  const [openDeletedConfirm, setOpenDeletedConfirm] = useState(false);
  const [deletedStudent, setDeletedStudent] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openBulkDeleteConfirm, setOpenBulkDeleteConfirm] = useState(false);
  const [openGraduationConfirm, setOpenGraduationConfirm] = useState(false);
  const [graduationStudent, setGraduationStudent] = useState<any | null>(null);
  const [isGraduating, setIsGraduating] = useState(false);
  const [openBulkGraduationConfirm, setOpenBulkGraduationConfirm] = useState(false);
  const [isGraduatingClassroom, setIsGraduatingClassroom] = useState(false);
  const [openPromoteConfirm, setOpenPromoteConfirm] = useState(false);
  const [promoteSource, setPromoteSource] = useState<any | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<any | null>(null);
  const [promotePreview, setPromotePreview] = useState<any | null>(null);
  const { data: promotePreviewData, isLoading: isLoadingPromotePreview } = usePromotePreview(
    promoteSource?.id ?? null,
  );
  const [openIndividualPromoteConfirm, setOpenIndividualPromoteConfirm] = useState(false);
  const [promoteStudent, setPromoteStudent] = useState<any | null>(null);
  const [promoteStudentTarget, setPromoteStudentTarget] = useState<any | null>(null);
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
    if (!classrooms.length || classroomInitialized.current) return;
    const target = classroom ? (classrooms.find((item: any) => item.id === classroom) ?? classrooms[0]) : classrooms[0];
    setInitClassroom(target ?? null);
    setCurrentClassroomId(target?.id ?? null);
    classroomInitialized.current = true;
  }, [classrooms, classroom]);

  useEffect(() => {
    if (promotePreviewData) {
      setPromotePreview(promotePreviewData);
    }
  }, [promotePreviewData]);

  // ─── Students via React Query ─────────────────────────────────────────────────

  const { data: students = [], isLoading: loadingStudent, refetch: refetchStudents } = useStudentsWithParams(
    {
      classroomId: currentClassroomId,
      search: deferredSearchValue,
      studentStatus: deferredSearchValue.studentStatus || undefined,
    },
    { enabled: true },
  );

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleChangeClassroom = useCallback((e: SelectChangeEvent, value: any) => {
    e.preventDefault();
    setCurrentClassroomId(value?.id ?? null);
    setInitClassroom(value);
    if (value?.id) {
      router.replace(`/apps/student/list?classroom=${value.id}`, { scroll: false });
    } else {
      router.replace('/apps/student/list', { scroll: false });
    }
  }, [router]);

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

  const handleStatusChange = useCallback((status: string) => {
    setSearchValue((prev) => ({ ...prev, studentStatus: status }));
  }, []);

  const handleDeleteClick = useCallback((student: any) => {
    setOpenDeletedConfirm(true);
    setDeletedStudent(student);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setIsDeleting(true);
    const toastId = toast.info('กำลังลบข้อมูล...', { autoClose: false, hideProgressBar: true });
    deleteStudent(deletedStudent.id, {
      onSuccess: () => {
        setIsDeleting(false);
        setOpenDeletedConfirm(false);
        toast.dismiss(toastId);
        toast.success('ลบข้อมูลสำเร็จ');
      },
      onError: () => {
        setIsDeleting(false);
        toast.dismiss(toastId);
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      },
    });
  }, [deletedStudent, deleteStudent]);

  const handleDeleteCancel = useCallback(() => {
    setOpenDeletedConfirm(false);
    setDeletedStudent(null);
  }, []);

  const handleBulkDeleteClick = useCallback(() => {
    if (!students.length) {
      toast.warn('ไม่มีนักเรียนในห้องนี้');
      return;
    }
    setOpenBulkDeleteConfirm(true);
  }, [students.length]);

  const handleBulkDeleteConfirm = useCallback(() => {
    if (!currentClassroomId) return;
    const toastId = toast.info('กำลังลบนักเรียนทั้งหมด...', { autoClose: false, hideProgressBar: true });
    deleteAllClassroom(currentClassroomId, {
      onSuccess: (result) => {
        setOpenBulkDeleteConfirm(false);
        toast.dismiss(toastId);
        toast.success(`ลบนักเรียน ${result.deleted} คน จากห้อง ${result.classroom} สำเร็จ`);
      },
      onError: () => {
        toast.dismiss(toastId);
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      },
    });
  }, [currentClassroomId, deleteAllClassroom]);

  const handleBulkDeleteCancel = useCallback(() => {
    setOpenBulkDeleteConfirm(false);
  }, []);

  const handleGraduationClick = useCallback((student: any) => {
    setOpenGraduationConfirm(true);
    setGraduationStudent(student);
  }, []);

  const handleGraduationConfirm = useCallback(
    (graduationDate: Date) => {
      setIsGraduating(true);
      const graduationYear = graduationDate.getFullYear() + 543;
      const toastId = toast.info('กำลังบันทึกการจบการศึกษา...', { autoClose: false, hideProgressBar: true });
      graduateStudent(
        { studentId: graduationStudent.id, graduationYear, graduationDate },
        {
          onSuccess: () => {
            setIsGraduating(false);
            setOpenGraduationConfirm(false);
            toast.dismiss(toastId);
            toast.success('บันทึกการจบการศึกษาสำเร็จ');
          },
          onError: () => {
            setIsGraduating(false);
            toast.dismiss(toastId);
            toast.error('เกิดข้อผิดพลาดในการบันทึกการจบการศึกษา');
          },
        },
      );
    },
    [graduationStudent, graduateStudent],
  );

  const handleGraduationCancel = useCallback(() => {
    setOpenGraduationConfirm(false);
    setGraduationStudent(null);
  }, []);

  const handleBulkGraduationClick = useCallback(() => {
    setOpenBulkGraduationConfirm(true);
  }, []);

  const handleBulkGraduationConfirm = useCallback(
    (graduationDate: Date) => {
      if (!currentClassroomId) return;
      setIsGraduatingClassroom(true);
      const graduationYear = graduationDate.getFullYear() + 543;
      const toastId = toast.info('กำลังบันทึกการจบการศึกษาทั้งห้อง...', { autoClose: false, hideProgressBar: true });
      graduateClassroom(
        { classroomId: currentClassroomId, graduationYear, graduationDate },
        {
          onSuccess: (result) => {
            setIsGraduatingClassroom(false);
            setOpenBulkGraduationConfirm(false);
            toast.dismiss(toastId);
            toast.success(`จบการศึกษา ${result.graduated} คน จากห้อง ${result.classroom} สำเร็จ`);
          },
          onError: () => {
            setIsGraduatingClassroom(false);
            toast.dismiss(toastId);
            toast.error('เกิดข้อผิดพลาดในการบันทึกการจบการศึกษา');
          },
        },
      );
    },
    [currentClassroomId, graduateClassroom],
  );

  const handleBulkGraduationCancel = useCallback(() => {
    setOpenBulkGraduationConfirm(false);
  }, []);

  const handlePromoteClick = useCallback(() => {
    setOpenPromoteConfirm(true);
  }, []);

  const handlePromoteSourceChange = useCallback(
    (value: any) => {
      setPromoteSource(value);
      if (promoteTarget?.id === value?.id) {
        setPromoteTarget(null);
      }
      setPromotePreview(null);
    },
    [promoteTarget],
  );

  const handlePromoteTargetChange = useCallback((value: any) => {
    setPromoteTarget(value);
  }, []);

  const handlePromoteConfirm = useCallback(() => {
    if (!promoteSource?.id || !promoteTarget?.id) return;

    const toastId = toast.info('กำลังเลื่อนชั้นนักเรียน...', {
      autoClose: false,
      hideProgressBar: true,
    });

    promoteStudents(
      {
        sourceClassroomId: promoteSource.id,
        targetClassroomId: promoteTarget.id,
      },
      {
        onSuccess: (result) => {
          toast.dismiss(toastId);
          toast.success(`เลื่อนชั้น ${result.promoted} คน สำเร็จ`);
          setOpenPromoteConfirm(false);
          setPromoteSource(null);
          setPromoteTarget(null);
          setPromotePreview(null);
          refetchStudents();
        },
        onError: () => {
          toast.dismiss(toastId);
          toast.error('เกิดข้อผิดพลาดในการเลื่อนชั้นนักเรียน');
        },
      },
    );
  }, [promoteSource, promoteTarget, promoteStudents, refetchStudents]);

  const handlePromoteCancel = useCallback(() => {
    setOpenPromoteConfirm(false);
    setPromoteSource(null);
    setPromoteTarget(null);
    setPromotePreview(null);
  }, []);

  const handleIndividualPromoteClick = useCallback((student: any) => {
    setPromoteStudent(student);
    setOpenIndividualPromoteConfirm(true);
  }, []);

  const handleIndividualPromoteTargetChange = useCallback((value: any) => {
    setPromoteStudentTarget(value);
  }, []);

  const handleIndividualPromoteConfirm = useCallback(() => {
    if (!promoteStudent?.id || !promoteStudentTarget?.id) return;

    const toastId = toast.info('กำลังเลื่อนชั้นนักเรียน...', {
      autoClose: false,
      hideProgressBar: true,
    });

    promoteStudents(
      {
        sourceClassroomId: promoteStudent.classroomId,
        targetClassroomId: promoteStudentTarget.id,
        studentIds: [promoteStudent.id],
      },
      {
        onSuccess: (result) => {
          toast.dismiss(toastId);
          toast.success(`เลื่อนชั้น ${result.promoted} คน สำเร็จ`);
          setOpenIndividualPromoteConfirm(false);
          setPromoteStudent(null);
          setPromoteStudentTarget(null);
          refetchStudents();
        },
        onError: () => {
          toast.dismiss(toastId);
          toast.error('เกิดข้อผิดพลาดในการเลื่อนชั้นนักเรียน');
        },
      },
    );
  }, [promoteStudent, promoteStudentTarget, promoteStudents, refetchStudents]);

  const handleIndividualPromoteCancel = useCallback(() => {
    setOpenIndividualPromoteConfirm(false);
    setPromoteStudent(null);
    setPromoteStudentTarget(null);
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
      const blob = new Blob([response.data], { type: String(contentType) });
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
          สถานะนักเรียน: student?.studentStatus ?? 'กำลังศึกษา',
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
    isDeleting,
    openBulkDeleteConfirm,
    isDeletingAll,
    openGraduationConfirm,
    graduationStudent,
    isGraduating,
    openBulkGraduationConfirm,
    isGraduatingClassroom,
    openPromoteConfirm,
    promoteSource,
    promoteTarget,
    promotePreview,
    isLoadingPromotePreview,
    isPromoting,
    openIndividualPromoteConfirm,
    promoteStudent,
    promoteStudentTarget,
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
    handleStatusChange,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleBulkDeleteClick,
    handleBulkDeleteConfirm,
    handleBulkDeleteCancel,
    handleGraduationClick,
    handleGraduationConfirm,
    handleGraduationCancel,
    handleBulkGraduationClick,
    handleBulkGraduationConfirm,
    handleBulkGraduationCancel,
    handlePromoteClick,
    handlePromoteSourceChange,
    handlePromoteTargetChange,
    handlePromoteConfirm,
    handlePromoteCancel,
    handleIndividualPromoteClick,
    handleIndividualPromoteTargetChange,
    handleIndividualPromoteConfirm,
    handleIndividualPromoteCancel,
    handleImportStudents,
    handleCloseImportResultDialog,
    handleDownloadTemplate,
    handleExportStudents,
    setPageSize,
  };
};
