import { useEffect, useState } from 'react';

import { shallow } from 'zustand/shallow';
import { useStudentStore } from '@/store/index';
import toast from 'react-hot-toast';

const useStudentList = (storedToken: string, debouncedValue: string) => {
  const { studentsList }: any = useStudentStore(
    (state: any) => ({
      fetchStudents: state.fetchStudents,
      studentsList: state.studentsList,
    }),
    shallow,
  );
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const result = await studentsList(storedToken, debouncedValue);
        setStudents(result || []);
        setLoading(false);
      } catch (error: any) {
        toast.error(error?.message || 'เกิดข้อผิดพลาด');
        setLoading(false);
      }
    };
    fetchStudents();
  }, [storedToken, debouncedValue]);

  return { loading, students };
};

export default useStudentList;
