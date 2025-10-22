import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface UserState {
  reportCheckIn: any;
  reportCheckInLoading: boolean;
  hasReportCheckInErrors: boolean;
  getReportCheckIn: (param: any) => any;
  addReportCheckIn: (data: any) => any;
  updateReportCheckIn: (data: string) => any;
  findDailyReport: (param: any) => any;
  findSummaryReport: (param: any) => any;
  removeReportCheckIn: (id: string) => any;
  findDailyReportAdmin: (param: any) => any;
  findStudentWeeklyReport: (param: any) => any;
}

export const useReportCheckInStore = createWithEqualityFn<UserState>()((set) => ({
  reportCheckIn: null,
  reportCheckInLoading: false,
  hasReportCheckInErrors: false,
  getReportCheckIn: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/teacher/${param.teacher}/classroom/${param.classroom}`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  addReportCheckIn: async (data: any) => {
    set({ reportCheckInLoading: true });
    try {
      const response = await httpClient.post(authConfig.reportCheckInEndpoint as string, data);
      set({ reportCheckIn: await response.data });
    } catch (err) {
      set({ reportCheckInLoading: false, hasReportCheckInErrors: true });
    }
  },
  updateReportCheckIn: async (data: any) => {
    set({ reportCheckInLoading: true });
    try {
      const response = await httpClient.patch(`${authConfig.reportCheckInEndpoint}/${data.id}/daily-report`, data);
      return await response.data;
    } catch (err) {
      return err;
    }
  },
  findDailyReport: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/start-date/${param.startDate}/daily-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  findSummaryReport: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/summary-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  removeReportCheckIn: async (id: string) => {
    try {
      const { data } = await httpClient.delete(`${authConfig.reportCheckInEndpoint}/${id}`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  findDailyReportAdmin: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/start-date/${param.startDate}/end-date/${param.endDate}/admin-daily-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  findStudentWeeklyReport: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/student/${param.studentId}/classroom/${param.classroomId}/start-date/${param.start}/end-date/${param.end}/weekly-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
}));
