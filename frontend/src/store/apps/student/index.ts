import axios from 'axios';
import create from 'zustand';

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
  removeStudents: () => any;
}

export const useStudentStore = create<StudentState>()(
  (set) => ({
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
        set({ students: await data, loading: false, hasErrors: false });
      } catch (err) {
        set({ loading: false, hasErrors: true });
      }
    },
    fetchStudentByClassroom: async (token: string, classroomId: any) => {
      set({ loading: true, students: [] });
      try {
        const { data } = await axios.get(`${authConfig.studentEndpoint}/classroom/${classroomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        set({ students: await data, loading: false, hasErrors: false });
        return await data;
      } catch (err) {
        set({ students: null, loading: false, hasErrors: true });
        return null;
      }
    },
    removeStudents: () => set({ students: [] }),
  }),
);