import { authConfig } from '@/configs/auth';
import { create } from 'zustand';
import httpClient from '@/@core/utils/http';

interface VisitQuery {
  classroomId?: string;
  academicYear?: string;
  visitNo?: string;
}
interface VisitState {
  fetchVisits: (token: string, params: VisitQuery) => any;
}

export const useVisitStore = create<VisitState>()(
  (set) => ({
    fetchVisits: async (token: string, params: VisitQuery) => {
      try {
        const { data } = await httpClient.get(
          `${authConfig.visitEndpoint}/get-visit/all?classroomId=${params.classroomId}&academicYear=${params.academicYear}&visitNo=${params.visitNo}`,
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