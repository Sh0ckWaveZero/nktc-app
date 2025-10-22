import { authConfig } from '@/configs/auth';
import { createWithEqualityFn } from 'zustand/traditional';
import httpClient from '@/@core/utils/http';

type Body = {
  fullName?: string;
  classroomId?: string;
  badDate?: Date | null;
  studentId?: string;
  skip?: number;
  take?: number;
};
interface BadnessIndividualState {
  createBadnessIndividual: (body: any) => any;
  createBadnessGroup: (body: any) => any;
  search: (body: Body) => any;
  summary: (body: any) => any;
  deleteBadnessIndividualById: (id: string) => any;
  fetchBadnessIndividualById: (body: Body) => any;
}

export const badnessIndividualStore = createWithEqualityFn<BadnessIndividualState>()(() => ({
  createBadnessIndividual: async (body: any) => {
    try {
      const response = await httpClient.post(`${authConfig.badnessIndividualEndpoint}`, body);
      return response;
    } catch (err) {
      console.error('Error creating badness individual:', err);
      return err;
    }
  },
  createBadnessGroup: async (body: Body) => {
    try {
      const response = await httpClient.post(`${authConfig.badnessIndividualEndpoint}/group`, body);
      return response;
    } catch (err) {
      console.error('Error creating goodness individual:', err);
      return err;
    }
  },
  search: async (body: any) => {
    try {
      const response = await httpClient.post(`${authConfig.badnessIndividualEndpoint}/search`, body);
      return response?.data;
    } catch (err) {
      console.error('Error creating badness individual:', err);
      return err;
    }
  },
  summary: async (body: any) => {
    try {
      const response = await httpClient.post(`${authConfig.badnessIndividualEndpoint}/summary`, body);
      return response?.data;
    } catch (err) {
      console.error('Error get summary:', err);
      return err;
    }
  },
  deleteBadnessIndividualById: async (id: string) => {
    try {
      const response = await httpClient.delete(`${authConfig.badnessIndividualEndpoint}/${id}`);
      return response;
    } catch (err) {
      console.error('Error deleting badness individual:', err);
      return err;
    }
  },
  fetchBadnessIndividualById: async (body: Body) => {
    try {
      const response = await httpClient.get(
        `${authConfig.badnessIndividualEndpoint}/${body.studentId}?skip=${body.skip}&take=${body.take}`,
      );
      return response?.data;
    } catch (err) {
      console.error('Error fetching badness individual:', err);
      return err;
    }
  },
}));
