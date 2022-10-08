import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';
import { Classroom } from '@/types/apps/teacherTypes';


interface classroomState {
  classroom: Classroom[];
  teacherClassroom: Array<[]>;
  fetchClassroom: (token: string) => any;
  fetchTeachClassroom: (token: string, teacherId: string) => any;
  clear: () => void;
}

export const useClassroomStore = create<classroomState>()(
  (set) => ({
    classroom: [],
    teacherClassroom: [],
    fetchClassroom: async (token: string) => {
      const { data } = await axios.get(authConfig.classroomEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ classroom: await data });
    },
    fetchTeachClassroom: async (token: string, teacherId: string) => {
      const { data } = await axios.get(`${authConfig.classroomEndpoint}/teacher/${teacherId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ teacherClassroom: await data });
    },
    clear: () => set({ classroom: [] }),
  }),
);
