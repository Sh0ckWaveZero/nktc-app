import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';
interface TeacherQuery {
  q: string;
}
interface TeacherState {
  teacher: Array<any>;
  loading: boolean,
  hasErrors: boolean,
  fetchTeacher: (token: string, params: TeacherQuery) => any;
  updateClassroom: (token: string, data: any) => any;
}

export const useTeacherStore = create<TeacherState>()(
  ((set) => ({
    teacher: [],
    loading: false,
    hasErrors: false,
    fetchTeacher: async (token: string, params: TeacherQuery) => {
      set({ loading: true });
      try {
        const { data } = await axios.get(authConfig.teacherEndpoint, {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ teacher: data, loading: false, hasErrors: false });
      } catch (err) {
        set({ loading: false, hasErrors: true });
      }
    },
    updateClassroom: async (token: string, teacher: any) => {
      set({ loading: true });
      try {
        const { data } = await axios.put(`${authConfig.teacherEndpoint}/classroom/${teacher.id}`, teacher, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ loading: false, hasErrors: false });
        return data;
      } catch (err) {
        set({ loading: false, hasErrors: true });
      }
    },
  })),

);