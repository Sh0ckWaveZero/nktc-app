import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';
import { Classroom } from '@/types/apps/teacherTypes';


interface classroomState {
  classroom: Classroom[];
  fetchClassroom: (token: string) => any;
  clear: () => void;
}

export const useClassroomStore = create<classroomState>()(
  devtools(
    persist(
      (set) => ({
        classroom: [],
        fetchClassroom: async (token: string) => {
          const response = await axios.get(authConfig.classroomListEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          set({ classroom: await response.data });
        },
        clear: () => set({ classroom: [] }),
      }),
      {
        name: 'classroom-storage',
      },
    ),
  ),
);
