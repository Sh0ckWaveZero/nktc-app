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
  createGoodnessIndividual: (body: any) => any;
  createGoodnessGroup: (body: any) => any;
  search: (body: Body) => any;
  summary: (body: any) => any;
  deleteGoodnessIndividualById: (id: string) => any;
  fetchGoodnessIndividualById: (body: Body) => any;
}

export const goodnessIndividualStore = createWithEqualityFn<GoodnessIndividualState>()(() => ({
  createGoodnessIndividual: async (body: Body) => {
    try {
      const response = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}`, body);
      return response;
    } catch (err) {
      console.error('Error creating goodness individual:', err);
      return err;
    }
  },
  createGoodnessGroup: async (body: Body) => {
    try {
      const response = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}/group`, body);
      return response;
    } catch (err) {
      console.error('Error creating goodness individual:', err);
      return err;
    }
  },
  search: async (body: any) => {
    try {
      const response = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}/search`, body);
      return response?.data;
    } catch (err) {
      console.error('Error creating goodness individual:', err);
      return err;
    }
  },
  summary: async (body: any) => {
    try {
      const response = await httpClient.post(`${authConfig.goodnessIndividualEndpoint}/summary`, body);
      return response?.data;
    } catch (err) {
      console.error('Error get summary:', err);
      return err;
    }
  },
  deleteGoodnessIndividualById: async (id: string) => {
    try {
      const response = await httpClient.delete(`${authConfig.goodnessIndividualEndpoint}/${id}`);
      return response;
    } catch (err) {
      console.error('Error delete goodness individual:', err);
      return err;
    }
  },
  fetchGoodnessIndividualById: async (body: Body) => {
    try {
      const response = await httpClient.get(
        `${authConfig.goodnessIndividualEndpoint}/${body.studentId}?skip=${body.skip}&take=${body.take}`,
      );
      return response?.data;
    } catch (err) {
      console.error('Error get goodness individual:', err);
      return err;
    }
  },
}));
