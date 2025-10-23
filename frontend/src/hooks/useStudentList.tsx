import toast from 'react-hot-toast';
import { useStudentsSearch } from '@/hooks/queries';

/**
 * Legacy hook wrapper - uses React Query under the hood
 * @deprecated Use useStudentsSearch() directly from @/hooks/queries
 */
const useStudentList = (debouncedValue: string) => {
  const { data: students = [], isLoading: loading, error } = useStudentsSearch({
    q: debouncedValue,
  });

  // Show error toast if query fails
  if (error) {
    toast.error((error as any)?.message || 'เกิดข้อผิดพลาด');
  }

  return { loading, students };
};

export default useStudentList;
