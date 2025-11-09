import { useCallback, useEffect, useDeferredValue, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useClassrooms, useStudentsSearch } from '@/hooks/queries';
import { useGoodnessSearch } from '@/hooks/queries/useGoodness';
import { queryKeys } from '@/libs/react-query/queryKeys';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { use } from 'react';

// Form schema
const searchFormSchema = z.object({
  student: z.any().nullable().optional(),
  classroom: z.any().nullable().optional(),
  goodDate: z.date().nullable().optional(),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

export const useGoodnessReport = () => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Form management
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      student: null,
      classroom: null,
      goodDate: new Date(),
    },
  });

  // Watch form values for student search
  const watchedStudent = watch('student');
  const watchedInputValue = useMemo(() => {
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

  // Local State
  const [searchParams, setSearchParams] = useState<any>(null);
  const [currentStudents, setCurrentStudents] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [inputValue, setInputValue] = useState<string>('');
  const deferredValue = useDeferredValue(watchedInputValue);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [mobilePage, setMobilePage] = useState<number>(0);
  const [mobilePageSize, setMobilePageSize] = useState<number>(5);

  // React Query hooks - Get all classrooms
  const { data: classrooms = [], isLoading: classroomLoading, error: classroomError } = useClassrooms();

  // Transform inputValue to proper format for useStudentsSearch
  const studentSearchParams = useMemo(() => {
    if (!deferredValue || !deferredValue.trim()) {
      return undefined;
    }
    return {
      fullName: deferredValue,
    };
  }, [deferredValue]);

  const { data: studentsListData = [], isLoading: loadingStudents, error: studentsError } = useStudentsSearch(
    studentSearchParams,
    {
      enabled: !!studentSearchParams?.fullName && deferredValue.trim().length > 0,
    }
  );

  // Create a Promise for goodness search
  const goodnessSearchPromise = useMemo(() => {
    if (!searchParams) {
      return Promise.resolve({ data: [], total: 0 });
    }

    return queryClient.fetchQuery({
      queryKey: queryKeys.goodness.list(searchParams),
      queryFn: async () => {
        const { data } = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}/search`, searchParams);

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
  const goodnessSearchDataFromUse = use(goodnessSearchPromise);

  // Fallback: Manual search trigger for goodness records
  const {
    data: goodnessSearchDataFallback,
    isLoading: loadingGoodnessSearch,
    error: goodnessSearchError,
  } = useGoodnessSearch(searchParams || undefined, {
    enabled: !!searchParams,
  });

  // Use data from `use` hook if available, otherwise fallback to React Query hook
  const finalGoodnessSearchData = goodnessSearchDataFromUse || goodnessSearchDataFallback;

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
    if (finalGoodnessSearchData) {
      const responseData = finalGoodnessSearchData?.data;

      if (Array.isArray(responseData)) {
        setCurrentStudents(responseData);
      } else {
        if (Array.isArray(finalGoodnessSearchData)) {
          setCurrentStudents(finalGoodnessSearchData);
        } else {
          setCurrentStudents([]);
        }
      }
    } else if (searchParams === null) {
      setCurrentStudents([]);
    }
  }, [finalGoodnessSearchData, searchParams]);

  // Handle search error
  useEffect(() => {
    if (goodnessSearchError) {
      const errorMessage =
        (goodnessSearchError as any)?.response?.data?.message ||
        (goodnessSearchError as any)?.message ||
        'เกิดข้อผิดพลาดในการค้นหา';
      toast.error(errorMessage);
    }
  }, [goodnessSearchError]);

  // Form submit handler
  const onSubmit = (data: SearchFormData) => {
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
    if (data.goodDate) {
      if (data.goodDate instanceof Date) {
        const dateStr = data.goodDate.toISOString().split('T')[0];
        requestBody.goodDate = dateStr;
      }
    }

    // Only make request if at least one filter is provided
    if (Object.keys(requestBody).length === 0) {
      toast.error('กรุณาเลือกเงื่อนไขการค้นหาอย่างน้อย 1 ข้อ');
      return;
    }

    startTransition(() => {
      setSearchParams(requestBody);
      setMobilePage(0);

      if (searchParams) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.goodness.list(requestBody),
        });
      }
    });
  };

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
    setMobilePage(0);
  };

  const handleSearchChange = (event: any, value: any, reason: any) => {
    if (reason !== 'blur' && reason !== 'reset') {
      setInputValue(value || '');
    }
  };

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

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
    loadingGoodnessSearch,

    // State
    isPending,
    watchedInputValue,
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

