import toast from 'react-hot-toast';
import { useClassrooms } from '@/hooks/queries';

/**
 * Legacy hook wrapper - uses React Query under the hood
 * @deprecated Use useClassrooms() directly from @/hooks/queries
 */
const useFetchClassrooms = () => {
  const { data: classrooms = [], isLoading: classroomLoading, error } = useClassrooms();

  // Show error toast if query fails
  if (error) {
    toast.error('เกิดข้อผิดพลาด');
  }

  return [classrooms, classroomLoading];
};

export default useFetchClassrooms;
