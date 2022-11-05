import axios from 'axios';
import create from 'zustand';

// ** Config
import { authConfig } from '@/configs/auth';
interface UserState {
  reportCheckIn: any;
  reportCheckInLoading: boolean,
  hasReportCheckInErrors: boolean,
  getReportCheckIn: (token: string, param: any) => any;
  addReportCheckIn: (token: string, data: any) => any;
  updateReportCheckIn: (token: string, data: string) => any;
  findDailyReport: (token: string, param: any) => any;
  findSummaryReport: (token: string, param: any) => any;
  removeReportCheckIn: (token: string, id: string) => any;
  findDailyReportAdmin: (token: string, param: any) => any;
}

export const useReportCheckInStore = create<UserState>()(
  (set) => ({
    reportCheckIn: null,
    reportCheckInLoading: false,
    hasReportCheckInErrors: false,
    getReportCheckIn: async (token: string, param: any) => {
      try {
        const { data } = await axios.get(
          `${authConfig.reportCheckInEndpoint}/teacher/${param.teacher}/classroom/${param.classroom}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return await data;
      } catch (err) {
        return err;
      }
    },
    addReportCheckIn: async (token: string, data: any) => {
      set({ reportCheckInLoading: true });
      try {
        const response = await axios.post(
          authConfig.reportCheckInEndpoint as string,
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
      set({ reportCheckInLoading: true });
      try {
        const response = await axios.patch(
          `${authConfig.reportCheckInEndpoint}/${data.id}/daily-report`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return await response.data;
      } catch (err) {
        return err;
      }
    },
    findDailyReport: async (token: string, param: any) => {
      try {
        const { data } = await axios.get(
          `${authConfig.reportCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/start-date/${param.startDate}/daily-report`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return await data;
      } catch (err) {
        return err;
      }
    },
    findSummaryReport: async (token: string, param: any) => {
      try {
        const { data } = await axios.get(
          `${authConfig.reportCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/summary-report`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return await data;
      } catch (err) {
        return err;
      }
    },
    removeReportCheckIn: async (token: string, id: string) => {
      try {
        const { data } = await axios.delete(
          `${authConfig.reportCheckInEndpoint}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return await data;
      } catch (err) {
        return err;
      }
    },
    findDailyReportAdmin: async (token: string, param: any) => {
      try {
        const { data } = await axios.get(
          `${authConfig.reportCheckInEndpoint}/start-date/${param.startDate}/end-date/${param.endDate}/admin-daily-report`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return await data;
      } catch (err) {
        return err;
      }
    },
  }),
);