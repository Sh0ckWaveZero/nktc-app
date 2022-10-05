import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';
interface StudentQuery {
  q: string;
}
interface StudentState {
  students: any;
  loading: boolean,
  hasErrors: boolean,
  fetchStudent: (token: string, params: StudentQuery) => any;
  fetchStudentByClassroom: (token: string, classroomId: any) => any;
}

export const useStudentStore = create<StudentState>()(
  devtools(
    persist((set) => ({
      students: [],
      loading: false,
      hasErrors: false,
      fetchStudent: async (token: string, params: StudentQuery) => {
        set({ loading: true });
        try {
          const { data } = await axios.get(authConfig.teacherEndpoint,
            {
              params: params,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          set({ students: data, loading: false, hasErrors: false });
        } catch (err) {
          set({ loading: false, hasErrors: true });
        }
      },
      fetchStudentByClassroom: async (token: string, teacherId: any) => {
        set({ loading: true });
        try {
          const { data } = await axios.get(`${authConfig.studentEndpoint}/classroom/${teacherId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          set({ students: data, loading: false, hasErrors: false });
        } catch (err) {
          set({ students: null, loading: false, hasErrors: true });
        }
      },
    }),
      {
        name: 'students-store',
      },
    ),
  ),
);