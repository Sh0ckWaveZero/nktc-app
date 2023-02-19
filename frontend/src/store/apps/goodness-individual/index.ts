import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { create } from 'zustand';

interface GoodnessIndividualState {
  createGoodnessIndividual: (token: string, body: any) => any;
}

export const goodnessIndividualStore = create<GoodnessIndividualState>()(
  () => ({
    createGoodnessIndividual: async (token: string, body: any) => {
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
  }),
);
