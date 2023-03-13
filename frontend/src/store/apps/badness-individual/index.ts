import { Dayjs } from 'dayjs';
import { authConfig } from '@/configs/auth';
import { create } from 'zustand';
import httpClient from '@/@core/utils/http';

type Body = {
  fullName?: string;
  classroomId?: string;
  badDate?: Dayjs | null;
  studentId?: string;
  skip?: number;
  take?: number;
};
interface BadnessIndividualState {
  createBadnessIndividual: (token: string, body: any) => any;
  createBadnessGroup: (token: string, body: any) => any;
  search: (token: string, body: Body) => any;
  summary : (token: string, body: any) => any;
}

export const badnessIndividualStore = create<BadnessIndividualState>()(
  () => ({
    createBadnessIndividual: async (token: string, body: any) => {
      try {
        const response = await httpClient.post(
          `${authConfig.badnessIndividualEndpoint}`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return response;
      } catch (err) {
        console.error('Error creating badness individual:', err);
        return err;
      }
    },
    createBadnessGroup: async (token: string, body: Body) => {
      try {
        const response = await httpClient.post(
          `${authConfig.badnessIndividualEndpoint}/group`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return response;
      } catch (err) {
        console.error('Error creating goodness individual:', err);
        return err;
      }
    },
    search: async (token: string, body: any) => {
      try {
        const response = await httpClient.post(
          `${authConfig.badnessIndividualEndpoint}/search`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return response?.data;
      } catch (err) {
        console.error('Error creating badness individual:', err);
        return err;
      }
    },
    summary: async (token: string, body: any) => {
      try {
        const response = await httpClient.post(
          `${authConfig.badnessIndividualEndpoint}/summary`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return response?.data;
      } catch (err) {
        console.error('Error get summary:', err);
        return err;
      }
    },
  }),
);
