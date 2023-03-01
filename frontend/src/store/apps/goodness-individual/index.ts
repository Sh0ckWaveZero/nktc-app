import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { create } from 'zustand';
import { Dayjs } from 'dayjs';

type Body = {
  fullName?: string;
  classroomId?: string;
  goodDate?: Dayjs | null;
};

interface GoodnessIndividualState {
  createGoodnessIndividual: (token: string, body: any) => any;
  createGoodnessGroup: (token: string, body: any) => any;
  search: (token: string, body: Body) => any;
}

export const goodnessIndividualStore = create<GoodnessIndividualState>()(
  () => ({
    createGoodnessIndividual: async (token: string, body: Body) => {
      try {
        const response = await httpClient.post(
          `${authConfig.goodnessIndividualEndpoint}`,
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
    createGoodnessGroup: async (token: string, body: Body) => {
      try {
        const response = await httpClient.post(
          `${authConfig.goodnessIndividualEndpoint}/group`,
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
          `${authConfig.goodnessIndividualEndpoint}/search`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return response?.data;
      } catch (err) {
        console.error('Error creating goodness individual:', err);
        return err;
      }
    },
  }),
);
