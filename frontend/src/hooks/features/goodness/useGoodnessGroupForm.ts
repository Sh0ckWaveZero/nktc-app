import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateGoodnessGroup } from '@/hooks/queries/useGoodness';
import useImageCompression from '@/hooks/useImageCompression';

export interface UseGoodnessGroupFormParams {
  students: any[];
  onSuccess?: () => void;
  onClose?: () => void;
}

export interface UseGoodnessGroupFormReturn {
  // Form state
  goodTypeScore: string;
  details: string;
  selectedDate: Date | null;
  imgSrc: string;
  inputValue: string;
  loadingImg: boolean;
  onSubmit: boolean;
  isSubmitting: boolean;

  // Handlers
  handleInputChange: (event: any) => void;
  handleInputImageReset: () => void;
  handleSubmit: (event: MouseEvent<HTMLButtonElement>) => void;
  handleSelectedDate: (date: Date | null) => void;
  handleClose: () => void;
  handleInputImageChange: (event: any) => void;
}

/**
 * Custom hook for managing goodness group form state and logic
 * Handles form validation, image upload, data transformation, and submission
 */
export const useGoodnessGroupForm = ({
  students,
  onSuccess,
  onClose,
}: UseGoodnessGroupFormParams): UseGoodnessGroupFormReturn => {
  // React Query mutation
  const createGoodnessGroupMutation = useCreateGoodnessGroup();

  // Image compression hook
  const { imageCompressed, handleInputImageChange } = useImageCompression();

  // Form state
  const [goodTypeScore, setGoodTypeScore] = useState<string>('');
  const [imgSrc, setImgSrc] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [onSubmit, setOnSubmit] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Handle image compression
  useEffect(() => {
    if (imageCompressed) {
      setLoadingImg(true);
      setImgSrc(imageCompressed);
      setLoadingImg(false);
    }
  }, [imageCompressed]);

  // Handle input changes
  const handleInputChange = useCallback((event: any) => {
    const { name, value } = event.target;
    if (name === 'details') {
      setDetails(value);
    } else if (name === 'goodTypeScore') {
      setGoodTypeScore(value);
    }
  }, []);

  // Handle date selection
  const handleSelectedDate = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, []);

  // Reset image input
  const handleInputImageReset = useCallback(() => {
    setInputValue('');
    setImgSrc('');
  }, []);

  // Transform student data to match backend expected format
  const transformStudentData = useCallback(() => {
    return students.map((student: any) => ({
      studentId: student.id || student.studentId,
      studentKey: student.studentKey || student.student?.studentKey || student.id,
      classroomId:
        student.classroomId || student.classroom?.id || student.student?.classroom?.id,
      goodnessScore: Number(goodTypeScore),
      goodnessDetail: details || undefined,
      image: imgSrc || undefined,
      goodDate: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
    }));
  }, [students, goodTypeScore, details, imgSrc, selectedDate]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setOnSubmit(true);

      // Validate required fields
      if (!goodTypeScore) {
        setOnSubmit(false);
        return;
      }

      if (students.length === 0) {
        toast.error('กรุณาเลือกนักเรียนอย่างน้อย 1 คน');
        setOnSubmit(false);
        return;
      }

      const body = transformStudentData();

      const toastId = toast.info('กำลังบันทึกข้อมูล...', {
        autoClose: false,
        hideProgressBar: true,
      });

      try {
        const response = await createGoodnessGroupMutation.mutateAsync(body);

        // Handle response wrapper
        const responseData = response?.data || response;

        if (responseData && !responseData.name) {
          toast.dismiss(toastId);
          toast.success('บันทึกข้อมูลสำเร็จ');

          // Clear form
          setImgSrc('');
          setGoodTypeScore('');
          setDetails('');
          setOnSubmit(false);

          // Call callbacks
          onSuccess?.();
          onClose?.();
        } else {
          throw new Error('Invalid response');
        }
      } catch (error: any) {
        const errorData = error?.response?.data || error?.data;
        const message =
          errorData?.message || error?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
        toast.dismiss(toastId);
        toast.error(message);
        setOnSubmit(false);
      }
    },
    [
      goodTypeScore,
      students,
      transformStudentData,
      createGoodnessGroupMutation,
      onSuccess,
      onClose,
    ],
  );

  // Handle dialog close with form reset
  const handleClose = useCallback(() => {
    setImgSrc('');
    setGoodTypeScore('');
    setDetails('');
    setOnSubmit(false);
    onClose?.();
  }, [onClose]);

  return {
    // Form state
    goodTypeScore,
    details,
    selectedDate,
    imgSrc,
    inputValue,
    loadingImg,
    onSubmit,
    isSubmitting: createGoodnessGroupMutation.isPending,

    // Handlers
    handleInputChange,
    handleInputImageReset,
    handleSubmit,
    handleSelectedDate,
    handleClose,
    handleInputImageChange,
  };
};
