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
  fetchTeacher: (params: TeacherQuery) => any;
  fetchStudentsByTeacherId: (teacherId: string) => any;
  updateClassroom: (data: any) => any;
  updateProfile: (data: any) => any;
  update(data: any): any;
  addTeacher(data: any): any;
  removeTeacher(id: string): any;
}

export const useTeacherStore = createWithEqualityFn<TeacherState>()((set) => ({
  teacher: [],
  classroomInfo: [],
  teacherLoading: false,
  hasErrors: false,
  fetchTeacher: async (params: TeacherQuery) => {
    set({ teacherLoading: true });
    try {
      const { data } = await httpClient.get(authConfig.teacherEndpoint as string, {
        params: params
      });
      set({ teacherLoading: false, hasErrors: false });
      return await data;
    } catch (err) {
      set({ teacherLoading: false, hasErrors: true });
      return err;
    }
  },
  fetchStudentsByTeacherId: async (teacherId: string) => {
    try {
      const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/students`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  updateClassroom: async (teacher: any) => {
    set({ teacherLoading: true });
    try {
      const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${teacher.id}/classrooms`, teacher);
      set({ teacherLoading: false, hasErrors: false });
      return await data;
    } catch (err) {
      set({ teacherLoading: false, hasErrors: true });
    }
  },
  updateProfile: async (teacher: any) => {
    set({ teacherLoading: true });
    try {
      const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${teacher.id}/profile`, teacher);
      set({ teacherLoading: false, hasErrors: false });
      return await data;
    } catch (err) {
      set({ teacherLoading: false, hasErrors: true });
    }
  },
  update: async (body: any) => {
    set({ teacherLoading: true });
    try {
      const { data } = await httpClient.put(`${authConfig.teacherEndpoint}/${body?.teacher?.id}`, body);
      return await data;
    } catch (err) {
      return err;
    }
  },
  addTeacher: async (body: any) => {
    try {
      const { data } = await httpClient.post(`${authConfig.teacherEndpoint}`, body);
      return await data;
    } catch (err) {
      return err;
    }
  },
  removeTeacher: async (id: string) => {
    try {
      const { data } = await httpClient.delete(`${authConfig.teacherEndpoint}/${id}`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  shallow,
}));
