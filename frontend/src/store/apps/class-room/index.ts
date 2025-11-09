import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import { Classroom } from '@/types/apps/teacherTypes';
import { shallow } from 'zustand/shallow';
import httpClient from '@/@core/utils/http';

interface classroomState {
  classroom: Classroom[];
  classroomLoading: boolean;
  classroomHasErrors: boolean;
  teacherClassroom: Array<[]>;
  fetchClassroom: () => any;
  fetchTeachClassroom: (teacherId: string) => any;
  removeClassrooms: (id: string) => void;
  fetchClassrooms: (body: any) => any;
  createClassroom: (data: any) => any;
}

export const useClassroomStore = createWithEqualityFn<classroomState>()((set) => ({
  classroom: [],
  teacherClassroom: [],
  classroomLoading: false,
  classroomHasErrors: false,
  fetchClassroom: async () => {
    try {
      const { data } = await httpClient.get(authConfig.classroomEndpoint as string);
      const classroomData = await data;
      // Ensure classroom is always an array
      const classroomArray = Array.isArray(classroomData) 
        ? classroomData 
        : (classroomData && typeof classroomData === 'object' && 'data' in classroomData && Array.isArray(classroomData.data))
          ? classroomData.data
          : [];
      set({ classroom: classroomArray, classroomLoading: false, classroomHasErrors: false });
      return classroomArray;
    } catch (err) {
      set({ classroom: [], classroomLoading: false, classroomHasErrors: true });
      return [];
    }
  },
  fetchClassrooms: async (body: any) => {
    try {
      const response = await httpClient.post(`${authConfig.classroomEndpoint}/search`, body);
      return response?.data;
    } catch (err) {
      console.log(err);
      return err;
    }
  },
  fetchTeachClassroom: async (teacherId: string) => {
    try {
      set({ classroomLoading: true });
      const { data } = await httpClient.get(`${authConfig.classroomEndpoint}/teacher/${teacherId}`);
      set({ teacherClassroom: await data, classroomLoading: false, classroomHasErrors: false });
      return await data;
    } catch (err) {
      set({ teacherClassroom: [], classroomLoading: false, classroomHasErrors: true });
    }
  },
  removeClassrooms: async (id: string) => {
    try {
      const { data } = await httpClient.delete(`${authConfig.classroomEndpoint}/${id}`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  createClassroom: async (data: any) => {
    try {
      const response = await httpClient.post(`${authConfig.classroomEndpoint}`, data);
      return response?.data;
    } catch (err) {
      console.log(err);
      return err;
    }
  },
}));
