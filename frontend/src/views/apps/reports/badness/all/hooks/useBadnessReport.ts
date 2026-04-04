import { useCallback, useEffect, useMemo, useState, useTransition, use } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useClassrooms, useStudentsSearch } from '@/hooks/queries';
import { queryKeys } from '@/libs/react-query/queryKeys';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

// Form schema
const searchFormSchema = z.object({
  student: z.any().nullable().optional(),
  classroom: z.any().nullable().optional(),
  badDate: z.date().nullable().optional(),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

// localStorage key
const BADNESS_REPORT_STORAGE_KEY = 'badness-report-filters';

export const useBadnessReport = () => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Load saved filters from localStorage on mount
  const getSavedFilters = useCallback(() => {
    try {
      const saved = localStorage.getItem(BADNESS_REPORT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          student: parsed.student || null,
          classroom: parsed.classroom || null,
          badDate: parsed.badDate ? new Date(parsed.badDate) : new Date(), // Default to today
        };
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    return {
      student: null,
      classroom: null,
      badDate: new Date(), // Default to today
    };
  }, []);

  // Form management
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: getSavedFilters(),
  });

  // Watch form values for student search
  const watchedStudent = watch('student');

  // Local State
  const [searchParams, setSearchParams] = useState<any>(null);
  const [currentStudents, setCurrentStudents] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [inputValue, setInputValue] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [mobilePage, setMobilePage] = useState<number>(0);
  const [mobilePageSize, setMobilePageSize] = useState<number>(5);

  // React Query hooks - Get all classrooms
  const { data: classrooms = [], isLoading: classroomLoading, error: classroomError } = useClassrooms();

  // Transform inputValue to proper format for useStudentsSearch
  const getWatchedInputValue = useCallback(() => {
    if (!watchedStudent) return '';
    if (watchedStudent.account) {
      const { title = '', firstName = '', lastName = '' } = watchedStudent.account;
      return `${title}${firstName} ${lastName}`.trim();
    }
    if (watchedStudent.fullName) {
      return `${watchedStudent.title || ''}${watchedStudent.fullName}`;
    }
    return '';
  }, [watchedStudent]);

  const watchedInputValue = getWatchedInputValue();

  const studentSearchParams = useMemo(() => {
    const inputValue = getWatchedInputValue();
    if (!inputValue || !inputValue.trim()) {
      return undefined;
    }
    return {
      fullName: inputValue,
    };
  }, [getWatchedInputValue]);

  const {
    data: studentsListData = [],
    isLoading: loadingStudents,
    error: studentsError,
  } = useStudentsSearch(studentSearchParams, {
    enabled: !!studentSearchParams?.fullName && watchedInputValue.trim().length > 0,
  });

  // Badness search hook
  const badnessSearchPromise = useMemo(() => {
    if (!searchParams) {
      return Promise.resolve({ data: [], total: 0 });
    }

    return queryClient.fetchQuery({
      queryKey: queryKeys.badness.list(searchParams),
      queryFn: async () => {
        const { data } = await httpClient.post(`${authConfig.badnessIndividualEndpoint}/search`, searchParams);

        // Handle different response formats
        if (!data || typeof data !== 'object') {
          return { data: [], total: 0 };
        }

        if ('success' in data && 'data' in data && data.data && typeof data.data === 'object') {
          if ('data' in data.data && Array.isArray(data.data.data)) {
            return {
              data: data.data.data,
              total: data.data.total || data.data.data.length,
            };
          }
          if (Array.isArray(data.data)) {
            return {
              data: data.data,
              total: data.data.length,
            };
          }
        }

        if ('data' in data && Array.isArray(data.data)) {
          return {
            data: data.data,
            total: data.total || data.data.length,
          };
        }

        if (Array.isArray(data)) {
          return {
            data,
            total: data.length,
          };
        }

        return { data: [], total: 0 };
      },
    });
  }, [searchParams, queryClient]);

  // Use `use` hook to read the Promise
  const badnessSearchDataFromUse = use(badnessSearchPromise);

  // Fallback: Manual search trigger for badness records
  const badnessSearchData = badnessSearchDataFromUse;

  // Show error toast if queries fail
  useEffect(() => {
    if (classroomError) {
      toast.error('เกิดข้อผิดพลาดในการโหลดห้องเรียน');
    }
  }, [classroomError]);

  useEffect(() => {
    if (studentsError) {
      toast.error((studentsError as any)?.message || 'เกิดข้อผิดพลาดในการค้นหานักเรียน');
    }
  }, [studentsError]);

  // Update currentStudents when search data changes
  useEffect(() => {
    if (badnessSearchData) {
      const responseData = badnessSearchData?.data;

      if (Array.isArray(responseData)) {
        setCurrentStudents(responseData);
      } else {
        if (Array.isArray(badnessSearchData)) {
          setCurrentStudents(badnessSearchData);
        } else {
          setCurrentStudents([]);
        }
      }
    } else if (searchParams === null) {
      setCurrentStudents([]);
    }
  }, [badnessSearchData, searchParams]);

  // Save form values to localStorage whenever they change
  useEffect(() => {
    const subscription = watch((value) => {
      try {
        const toSave = {
          student: value.student,
          classroom: value.classroom,
          badDate: value.badDate ? value.badDate.toISOString() : null,
        };
        localStorage.setItem(BADNESS_REPORT_STORAGE_KEY, JSON.stringify(toSave));
      } catch (error) {
        console.error('Error saving filters to localStorage:', error);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  // Form submit handler
  const onSubmit = useCallback(
    (data: SearchFormData) => {
      const requestBody: any = {};

      // Build fullName from student object structure or inputValue
      if (data.student) {
        if (data.student.fullName && typeof data.student.fullName === 'string') {
          requestBody.fullName = data.student.fullName.trim();
        } else if (data.student.account) {
          const { firstName = '', lastName = '' } = data.student.account;
          const fullName = `${firstName} ${lastName}`.trim();
          if (fullName) {
            requestBody.fullName = fullName;
          }
        }
      } else {
        const typedName = inputValue?.trim() || watchedInputValue?.trim() || '';
        if (typedName) {
          requestBody.fullName = typedName;
        }
      }

      // Add classroomId if selected
      if (data.classroom?.id) {
        requestBody.classroomId = data.classroom.id;
      }

      // Convert Date to ISO string if Date object
      if (data.badDate) {
        if (data.badDate instanceof Date) {
          const dateStr = data.badDate.toISOString().split('T')[0];
          requestBody.badDate = dateStr;
        }
      }

      // Only make request if at least one filter is provided
      if (Object.keys(requestBody).length === 0) {
        toast.error('กรุณาเลือกเงื่อนไขการค้นหาอย่างน้อย 1 ข้อ');
        return;
      }

      startTransition(() => {
        setSearchParams(requestBody);
        setMobilePage((prev) => 0);

        if (searchParams) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.badness.list(requestBody),
          });
        }
      });
    },
    [inputValue, watchedInputValue, searchParams, queryClient, startTransition],
  );

  const onClear = useCallback(() => {
    setCurrentStudents([]);
    setInfo(null);
    setSearchParams(null);
    setInputValue('');
    setMobilePage(0);
    reset();
  }, [reset]);

  const handleClickOpen = (info: any) => {
    setOpen(true);
    setInfo(info);
  };

  const handleClose = () => {
    setOpen(false);
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
    setMobilePage((prev) => 0);
  };

  const handleSearchChange = (event: any, value: any, reason: any) => {
    if (reason !== 'blur' && reason !== 'reset') {
      setInputValue(value || '');
    }
  };

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(onSubmit)();
    },
    [handleSubmit, onSubmit],
  );

  const handleSearchClick = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleClearClick = useCallback(() => {
    onClear();
  }, [onClear]);

  return {
    // Form
    control,
    watch,
    errors,

    // Data
    classrooms,
    classroomLoading,
    studentsListData,
    loadingStudents,
    currentStudents,
    loadingBadnessSearch: false,

    // State
    isPending,
    pageSize,
    setPageSize,
    mobilePage,
    mobilePageSize,
    open,
    info,

    // Handlers
    handleClickOpen,
    handleClose,
    handleSearchChange,
    handleFormSubmit,
    handleSearchClick,
    handleClearClick,

    // Mobile pagination
    getPaginatedStudents,
    getTotalMobilePages,
    handleMobilePageChange,
    handleMobilePageSizeChange,
  };
};
