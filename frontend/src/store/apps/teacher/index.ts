import { create } from 'zustand';

// ** Config
import { authConfig } from '@/configs/auth';
import { shallow } from 'zustand/shallow';
import httpClient from '@/@core/utils/http';
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
  updateProfile: (token: string, data: any) => any;
  update(token: string, data: any): any;
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
        const { data } = await httpClient.get(authConfig.teacherEndpoint as string, {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return await data;
      } catch (err) {
        return err;
      }
    },
    fetchClassroomByTeachId: async (token: string, teacherId: string) => {
      try {
        const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/check-in`, {
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
        const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${teacher.id}/classrooms`, teacher, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ teacherLoading: false, hasErrors: false });
        return await data;
      } catch (err) {
        set({ teacherLoading: false, hasErrors: true });
      }
    },
    updateProfile: async (token: string, teacher: any) => {
      set({ teacherLoading: true });
      try {
        const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${teacher.id}/profile`, teacher, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ teacherLoading: false, hasErrors: false });
        return await data;
      } catch (err) {
        set({ teacherLoading: false, hasErrors: true });
      }
    },
    update: async (token: string, body: any) => {
      set({ teacherLoading: true });
      try {
        const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${body?.teacher?.id}`, body, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return await data;
      } catch (err) {
        return err;
      }
    },
    shallow,
  }),

);