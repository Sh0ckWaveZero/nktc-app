import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';

interface UserState {
  reportCheckIn: any;
  reportCheckInLoading: boolean,
  hasReportCheckInErrors: boolean,
  getReportCheckIn: (token: string, param: any) => any;
  addReportCheckIn: (token: string, data: any) => any;
  updateReportCheckIn: (token: string, data: string) => any;
}

export const useReportCheckInStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        reportCheckIn: null,
        reportCheckInLoading: false,
        hasReportCheckInErrors: false,
        getReportCheckIn: async (token: string, param: any) => {
          set({ reportCheckInLoading: true });
          try {
            const { data } = await axios.get(
              `${authConfig.reportCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            set({ reportCheckIn: data, reportCheckInLoading: false, hasReportCheckInErrors: false });
          } catch (err) {
            set({ reportCheckInLoading: false, hasReportCheckInErrors: true });
          }
        },
        addReportCheckIn: async (token: string, data: any) => {
          set({ reportCheckInLoading: true });
          try {
            const response = await axios.post(
              authConfig.reportCheckInEndpoint,
              data,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            set({ reportCheckIn: await response.data });
          } catch (err) {
            set({ reportCheckInLoading: false, hasReportCheckInErrors: true });
          }
        },
        updateReportCheckIn: async (token: string, data: any) => {
          const response = await axios.delete(authConfig.reportCheckInEndpoint);
          set({ reportCheckIn: await response.data });
        },
      }),
      {
        name: 'user-storage',
      },
    ),
  ),
);