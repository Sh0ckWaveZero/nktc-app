import axios from 'axios';
import { create } from 'zustand';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
interface StudentQuery {
  q: string;
}
interface StudentState {
  students: any;
  loading: boolean,
  hasErrors: boolean,
  fetchStudent: (token: string, params: StudentQuery) => any;
  fetchStudentByClassroom: (token: string, classroomId: any) => any;
  updateStudentProfile: (token: string, studentId: string, data: any) => any;
  createStudentProfile: (token: string, userId: string, data: any) => any;
  removeStudents: (token: string, studentId: string) => any;
  getAvatar: (token: string, url: string) => any;
}

export const useStudentStore = create<StudentState>()(
  (set) => ({
    students: [],
    loading: false,
    hasErrors: false,
    fetchStudent: async (token: string, params: StudentQuery) => {
      set({ loading: true });
      try {
        const { data } = await httpClient.get(authConfig.teacherEndpoint as string,
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
        const { data } = await httpClient.get(`${authConfig.studentEndpoint}/classroom/${classroomId}`,
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
    removeStudents: async (token: string, studentId: string) => {
      try {
        return await httpClient.delete(`${authConfig.studentEndpoint}/profile/${studentId}`,
          {
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
        const { data } = await httpClient.put(`${authConfig.studentEndpoint}/profile/${studentId}`,
          params,
          {
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
        return await httpClient.post(`${authConfig.studentEndpoint}/profile/${userId}`,
          params,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
      } catch (err) {
        return err;
      }
    },
    getAvatar: async (token: string, url: string) => {
      try {
        const { data } = await httpClient.get(url,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return await data;
      } catch (err) {
        return err;
      }
    }
  }),
);