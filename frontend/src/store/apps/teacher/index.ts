import axios from 'axios';
import create from 'zustand';

// ** Config
import authConfig from '@/configs/auth';
import shallow from 'zustand/shallow';
interface TeacherQuery {
  q: string;
}
interface TeacherState {
  teacher: Array<any>;
  classroomInfo: any;
  teacherLoading: boolean,
  hasErrors: boolean,
  fetchTeacher: (token: string, params: TeacherQuery) => any;
  fetchClassroomByTeachId: (token: string, teacherId: string) => any;
  updateClassroom: (token: string, data: any) => any;
}

export const useTeacherStore = create<TeacherState>()(
  (set) => ({
    teacher: [],
    classroomInfo: [],
    teacherLoading: false,
    hasErrors: false,
    fetchTeacher: async (token: string, params: TeacherQuery) => {
      set({ teacherLoading: true });
      try {
        const { data } = await axios.get(authConfig.teacherEndpoint, {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ teacher: data, teacherLoading: false, hasErrors: false });
      } catch (err) {
        set({ teacher: [], teacherLoading: false, hasErrors: true });
      }
    },
    fetchClassroomByTeachId: async (token: string, teacherId: string) => {
      try {
        const { data } = await axios.get(`${authConfig.teacherEndpoint}/${teacherId}/check-in`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return await data;
      } catch (err) {
        return err;
      }
    },
    updateClassroom: async (token: string, teacher: any) => {
      set({ teacherLoading: true });
      try {
        const { data } = await axios.put(`${authConfig.teacherEndpoint}/classroom/${teacher.id}`, teacher, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ teacherLoading: false, hasErrors: false });
        return data;
      } catch (err) {
        set({ teacherLoading: false, hasErrors: true });
      }
    },
    shallow,
  }),

);