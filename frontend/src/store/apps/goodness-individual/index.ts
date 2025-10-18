import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { createWithEqualityFn } from 'zustand/traditional';

type Body = {
  fullName?: string;
  classroomId?: string;
  goodDate?: Date | null;
  studentId?: string;
  skip?: number;
  take?: number;
};

interface GoodnessIndividualState {
  createGoodnessIndividual: (token: string, body: any) => any;
  createGoodnessGroup: (token: string, body: any) => any;
  search: (token: string, body: Body) => any;
  summary: (token: string, body: any) => any;
  deleteGoodnessIndividualById: (token: string, id: string) => any;
  fetchGoodnessIndividualById: (token: string, body: Body) => any;
}

export const goodnessIndividualStore = createWithEqualityFn<GoodnessIndividualState>()(() => ({
  createGoodnessIndividual: async (token: string, body: Body) => {
    try {
      const response = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}`, body, {
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
      const response = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}/group`, body, {
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
      const response = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}/search`, body, {
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
  summary: async (token: string, body: any) => {
    try {
      const response = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}/summary`, body, {
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
  deleteGoodnessIndividualById: async (token: string, id: string) => {
    try {
      const response = await httpClient.delete(`${authConfig.goodnessIndividualEndpoint}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (err) {
      console.error('Error delete goodness individual:', err);
      return err;
    }
  },
  fetchGoodnessIndividualById: async (token: string, body: Body) => {
    try {
      const response = await httpClient.get(
        `${authConfig.goodnessIndividualEndpoint}/${body.studentId}?skip=${body.skip}&take=${body.take}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response?.data;
    } catch (err) {
      console.error('Error get goodness individual:', err);
      return err;
    }
  },
}));
