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
  fetchStudents: (token: string, params: StudentQuery) => any;
  studentsList: (token: string, params: StudentQuery) => any;
  fetchStudentsWithParams: (token: string, params: any) => any;
  updateStudentProfile: (token: string, studentId: string, data: any) => any;
  createStudentProfile: (token: string, userId: string, data: any) => any;
  removeStudents: (token: string, studentId: string) => any;
  getAvatar: (token: string, url: string) => any;
  getTrophyOverview: (token: string, studentId: string) => any;
  getTeacherClassroom: (token: string, classroomId: string) => any;
}

export const useStudentStore = createWithEqualityFn<StudentState>()((set) => ({
  students: [],
  loading: false,
  hasErrors: false,
  fetchStudents: async (token: string, params: StudentQuery) => {
    set({ loading: true });
    try {
      const { data } = await httpClient.get(authConfig.studentEndpoint + '/search', {
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
  studentsList: async (token: string, params: StudentQuery) => {
    try {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/list`, {
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
  fetchStudentsWithParams: async (token: string, params: any) => {
    try {
      const { data } = await httpClient.post(
        `${authConfig.studentEndpoint}/search-with-params`,
        {
          classroomId: params?.classroomId || null,
          search: params?.search || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return await data;
    } catch (err) {
      return null;
    }
  },
  removeStudents: async (token: string, studentId: string) => {
    try {
      return await httpClient.delete(`${authConfig.studentEndpoint}/profile/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      return err;
    }
  },
  updateStudentProfile: async (token: string, studentId: string, params: any) => {
    set({ loading: true });
    try {
      const { data } = await httpClient.put(`${authConfig.studentEndpoint}/profile/${studentId}`, params, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ loading: false, hasErrors: false });
      return await data;
    } catch (err) {
      set({ loading: false, hasErrors: true });
      return err;
    }
  },
  createStudentProfile: async (token: string, userId: string, params: any) => {
    try {
      return await httpClient.post(`${authConfig.studentEndpoint}/profile/${userId}`, params, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      return err;
    }
  },
  getAvatar: async (token: string, url: string) => {
    try {
      const { data } = await httpClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await data;
    } catch (err) {
      return err;
    }
  },
  getTrophyOverview: async (token: string, studentId: string) => {
    try {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/trophy-overview/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await data;
    } catch (err) {
      return err;
    }
  },
  getTeacherClassroom: async (token: string, classroomId: string) => {
    try {
      const { data } = await httpClient.get(`${authConfig.studentEndpoint}/classroom/${classroomId}/teacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await data;
    } catch (err) {
      return err;
    }
  },
}));
