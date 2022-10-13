import axios from 'axios';
import create from 'zustand';

// ** Config
import authConfig from '@/configs/auth';
import { Classroom } from '@/types/apps/teacherTypes';


interface classroomState {
  classroom: Classroom[];
  classroomLoading: boolean,
  classroomHasErrors: boolean,
  teacherClassroom: Array<[]>;
  fetchClassroom: (token: string) => any;
  fetchTeachClassroom: (token: string, teacherId: string) => any;
  removeClassrooms: () => void;
}

export const useClassroomStore = create<classroomState>()(
  (set) => ({
    classroom: [],
    teacherClassroom: [],
    classroomLoading: false,
    classroomHasErrors: false,
    fetchClassroom: async (token: string) => {
      try {
        set({ classroomLoading: true });
        const { data } = await axios.get(authConfig.classroomEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ classroom: await data, classroomLoading: false, classroomHasErrors: false });
      } catch (err) {
        set({ classroomLoading: false, classroomHasErrors: true });
      }
    },
    fetchTeachClassroom: async (token: string, teacherId: string) => {
      try {
        set({ classroomLoading: true });
        const { data } = await axios.get(`${authConfig.classroomEndpoint}/teacher/${teacherId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ teacherClassroom: await data, classroomLoading: false, classroomHasErrors: false });
      } catch (err) {
        set({ teacherClassroom: [], classroomLoading: false, classroomHasErrors: true });
      }
    },
    removeClassrooms: () => set({ classroom: [] }),
  })
);

