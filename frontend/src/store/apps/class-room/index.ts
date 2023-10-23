import { createWithEqualityFn } from 'zustand/traditional';;

// ** Config
import { authConfig } from '@/configs/auth';
import { Classroom } from '@/types/apps/teacherTypes';
import { shallow } from 'zustand/shallow';
import httpClient from '@/@core/utils/http';

interface classroomState {
  classroom: Classroom[];
  classroomLoading: boolean,
  classroomHasErrors: boolean,
  teacherClassroom: Array<[]>;
  fetchClassroom: (token: string) => any;
  fetchTeachClassroom: (token: string, teacherId: string) => any;
  removeClassrooms: (token: string, id: string) => void;
  fetchClassrooms: (token: string, body: any) => any;
  createClassroom: (token: string, data: any) => any;
}

export const useClassroomStore = createWithEqualityFn<classroomState>()(
  (set) => ({
    classroom: [],
    teacherClassroom: [],
    classroomLoading: false,
    classroomHasErrors: false,
    fetchClassroom: async (token: string) => {
      try {
        const { data } = await httpClient.get(authConfig.classroomEndpoint as string, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ classroom: await data, classroomLoading: false, classroomHasErrors: false });
        return await data;
      } catch (err) {
        set({ classroomLoading: false, classroomHasErrors: true });
        return null;
      }
    },
    fetchClassrooms: async (token: string, body: any) => {
      try {
        const response = await httpClient.post(
          `${authConfig.classroomEndpoint}/search`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return response?.data;
      } catch (err) {
        console.log(err);
        return err;
      }
    },
    fetchTeachClassroom: async (token: string, teacherId: string) => {
      try {
        set({ classroomLoading: true });
        const { data } = await httpClient.get(`${authConfig.classroomEndpoint}/teacher/${teacherId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ teacherClassroom: await data, classroomLoading: false, classroomHasErrors: false });
        return await data;
      } catch (err) {
        set({ teacherClassroom: [], classroomLoading: false, classroomHasErrors: true });
      }
    },
    removeClassrooms: async (token: string, id: string) => {
      try {
        const { data } = await httpClient.delete(`${authConfig.classroomEndpoint}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return await data;
      } catch (err) {
        return err;
      }
    },
    createClassroom: async (token: string, data: any) => {
      try {
        const response = await httpClient.post(
          `${authConfig.classroomEndpoint}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return response?.data;
      } catch (err) {
        console.log(err);
        return err;
      }
    }
  })
);

