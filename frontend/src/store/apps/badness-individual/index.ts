import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { create } from 'zustand';

interface BadnessIndividualState {
  createBadnessIndividual: (token: string, body: any) => any;
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
  }),
);
