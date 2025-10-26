import { createWithEqualityFn } from 'zustand/traditional';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface AppbarState {
  appbar: any[];
  defaultSuggestions: any[];
  fetchAppbar: (params?: string, token?: string) => Promise<void>;
  fetchDefaultSuggestions: () => Promise<void>;
}

export const useAppbarStore = createWithEqualityFn<AppbarState>()(
  devtools(
    persist(
      (set) => ({
        appbar: [],
        defaultSuggestions: [],

        fetchAppbar: async (params: string = '', token?: string) => {
          try {
            const response = await httpClient.get(authConfig.appbarEndpoint as string, {
              params: { q: params }
            });

            // Handle wrapped response { success, data, meta }
            // API returns: { data: { success, data: [...], meta } }
            const apiData = response?.data?.data;

            if (apiData && Array.isArray(apiData)) {
              set({ appbar: apiData });
            } else {
              set({ appbar: [] });
            }
          } catch (error) {
            set({ appbar: [] });
          }
        },

        fetchDefaultSuggestions: async () => {
          try {
            const response = await httpClient.get(authConfig.appbarDefaultSuggestionsEndpoint as string);

            // Handle wrapped response { success, data, meta }
            const data = response?.data?.data || response?.data;

            if (data && Array.isArray(data)) {
              set({ defaultSuggestions: data });
            } else {
              set({ defaultSuggestions: [] });
            }
          } catch (error) {
            set({ defaultSuggestions: [] });
          }
        },
      }),
      {
        name: 'appbar-store',
      })));
