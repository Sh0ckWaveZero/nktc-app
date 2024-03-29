import { useEffect, useState } from 'react';

import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useClassroomStore } from '@/store/index';

const useFetchClassrooms = (storedToken: string) => {
  const { fetchClassroom }: any = useClassroomStore(
    (state: any) => ({
      fetchClassroom: state.fetchClassroom,
    }),
    shallow,
  );

  const [classrooms, setClassrooms] = useState<any>([]);
  const [classroomLoading, setClassroomLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setClassroomLoading(true);
        const response = await fetchClassroom(storedToken);
        setClassrooms(response);
        setClassroomLoading(false);
      } catch (error) {
        toast.error('เกิดข้อผิดพลาด');
        setClassroomLoading(false);
      }
    };
    fetch();
  }, [storedToken]);

  return [classrooms, classroomLoading];
};

export default useFetchClassrooms;
