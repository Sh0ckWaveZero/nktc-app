import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware'
// ** Config
import authConfig from '@/configs/auth';
import { Classroom } from "../@core/utils/types";
interface TeacherQuery {
  q: string
  role: string
  status: string
  currentPlan: string
}

interface TeacherState {
  teacher: Array<any>
  fetchTeacher: (params: TeacherQuery) => any
}

interface classroomState {
  classroom: Classroom[]
  fetchClassroom: (token: string) => any
  clear: () => void
}

export const useTeacherStore = create<TeacherState>()(
  devtools(
    persist(
      (set) => ({
        teacher: [],
        fetchTeacher: async (params: TeacherQuery) => {
          const response = await axios.get(
            authConfig.teacherListEndpoint,
            {
              params,
            },
          );
          set({ teacher: await response.data })
        },
      }),
    ),
    {
      name: 'teacher-store',
    }
  )
);

export const useUserStore = create<any>()(
  devtools(
    persist(
      (set) => ({
        user: [],
        addUser: async (data: any) => {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/users`,
            {
              data,
            });
          set({ user: await response.data });
        },
        deleteUser: async (id: number | string) => {
          const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
          );
          set({ user: await response.data });
        },
      }),
      {
        name: 'user-storage',
      }
    )
  )
)

export const useAppbarStore = create<any>()(
  devtools(
    persist(
      (set) => ({
        appbar: [],
        fetchAppbar: async (params: string, token: string) => {
          const response = await axios.get(
            authConfig.appbarEndpoint,
            {
              params: { q: params },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          set({ appbar: await response.data })
        },
      }),
    ),
    {
      name: 'appbar-store',
    }
  )
);

export const useClassroomStore = create<classroomState>()(
  devtools(
    persist(
      (set) => ({
        classroom: [],
        fetchClassroom: async (token: string) => {
          const response = await axios.get(
            authConfig.classroomListEndpoint,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          set({ classroom: await response.data })
        },
        clear: () => set({ classroom: [] }),
      }),
      {
        name: 'classroom-storage',
      }
    )
  )
)