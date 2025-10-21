import { createWithEqualityFn } from 'zustand/traditional';

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
  teacherLoading: boolean;
  hasErrors: boolean;
  fetchTeacher: (token: string, params: TeacherQuery) => any;
  fetchStudentsByTeacherId: (token: string, teacherId: string) => any;
  updateClassroom: (token: string, data: any) => any;
  updateProfile: (token: string, data: any) => any;
  update(token: string, data: any): any;
  addTeacher(token: string, data: any): any;
  removeTeacher(token: string, id: string): any;
}

export const useTeacherStore = createWithEqualityFn<TeacherState>()((set) => ({
  teacher: [],
  classroomInfo: [],
  teacherLoading: false,
  hasErrors: false,
  fetchTeacher: async (token: string, params: TeacherQuery) => {
    set({ teacherLoading: true });
    try {
      const { data } = await httpClient.get(authConfig.teacherEndpoint as string, {
        params: params
      });
      return await data;
    } catch (err) {
      return err;
    }
  },
  fetchStudentsByTeacherId: async (token: string, teacherId: string) => {
    try {
      const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/students`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  updateClassroom: async (token: string, teacher: any) => {
    set({ teacherLoading: true });
    try {
      const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${teacher.id}/classrooms`, teacher);
      set({ teacherLoading: false, hasErrors: false });
      return await data;
    } catch (err) {
      set({ teacherLoading: false, hasErrors: true });
    }
  },
  updateProfile: async (token: string, teacher: any) => {
    set({ teacherLoading: true });
    try {
      const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${teacher.id}/profile`, teacher);
      set({ teacherLoading: false, hasErrors: false });
      return await data;
    } catch (err) {
      set({ teacherLoading: false, hasErrors: true });
    }
  },
  update: async (token: string, body: any) => {
    set({ teacherLoading: true });
    try {
      const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${body?.teacher?.id}`, body);
      return await data;
    } catch (err) {
      return err;
    }
  },
  addTeacher: async (token: string, body: any) => {
    try {
      const { data } = await httpClient.post(`${authConfig.teacherEndpoint}`, body);
      return await data;
    } catch (err) {
      return err;
    }
  },
  removeTeacher: async (token: string, id: string) => {
    try {
      const { data } = await httpClient.delete(`${authConfig.teacherEndpoint}/${id}`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  shallow,
}));
