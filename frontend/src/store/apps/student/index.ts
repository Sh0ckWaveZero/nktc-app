import { authConfig } from '@/configs/auth';
import { createWithEqualityFn } from 'zustand/traditional';
import httpClient from '@/@core/utils/http';

interface StudentQuery {
  q?: string;
  fullName?: string;
  studentId?: string;
}
interface StudentState {
  students: any;
  loading: boolean;
  hasErrors: boolean;
  fetchStudents: (params: StudentQuery) => any;
  studentsList: (params: StudentQuery) => any;
  fetchStudentsWithParams: (params: any) => any;
  updateStudentProfile: (studentId: string, data: any) => any;
  createStudentProfile: (userId: string, data: any) => any;
  removeStudents: (studentId: string) => any;
  getAvatar: (url: string) => any;
  getTrophyOverview: (studentId: string) => any;
  getTeacherClassroom: (classroomId: string) => any;
}

export const useStudentStore = createWithEqualityFn<StudentState>()((set) => ({
  students: [],
  loading: false,
  hasErrors: false,
  fetchStudents: async (params: StudentQuery) => {
    set({ loading: true });
    try {
      const { data } = await httpClient.get(authConfig.studentEndpoint + '/search', {
        params: params,
      });
      return await data;
    } catch (err) {
      return err;
    }
  },
  studentsList: async (params: StudentQuery) => {
    try {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/list`, {
        params: params,
      });
      return await data;
    } catch (err) {
      return err;
    }
  },
  fetchStudentsWithParams: async (params: any) => {
    try {
      const { data } = await httpClient.post(
        `${authConfig.studentEndpoint}/search-with-params`,
        {
          classroomId: params?.classroomId || null,
          search: params?.search || null,
        }
      );
      return await data;
    } catch (err) {
      return null;
    }
  },
  removeStudents: async (studentId: string) => {
    try {
      return await httpClient.delete(`${authConfig.studentEndpoint}/profile/${studentId}`);
    } catch (err) {
      return err;
    }
  },
  updateStudentProfile: async (studentId: string, params: any) => {
    set({ loading: true });
    try {
      const { data } = await httpClient.put(`${authConfig.studentEndpoint}/profile/${studentId}`, params);
      set({ loading: false, hasErrors: false });
      return await data;
    } catch (err) {
      set({ loading: false, hasErrors: true });
      return err;
    }
  },
  createStudentProfile: async (userId: string, params: any) => {
    try {
      return await httpClient.post(`${authConfig.studentEndpoint}/profile/${userId}`, params);
    } catch (err) {
      return err;
    }
  },
  getAvatar: async (url: string) => {
    try {
      const { data } = await httpClient.get(url);
      return await data;
    } catch (err) {
      return err;
    }
  },
  getTrophyOverview: async (studentId: string) => {
    try {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/trophy-overview/${studentId}`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  getTeacherClassroom: async (classroomId: string) => {
    try {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/classroom/${classroomId}/teacher`);
      return await data;
    } catch (err) {
      return err;
    }
  },
}));
