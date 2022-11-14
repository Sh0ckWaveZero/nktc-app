import create from 'zustand';

// ** Config
import { authConfig } from '@/configs/auth';
import { LoginParams } from '@/context/types';
import { userInfo } from 'os';
import httpClient from '@/@core/utils/http';
interface UserState {
  userInfo: any;
  userLoading: boolean,
  hasErrors: boolean,
  login: (params: LoginParams) => any;
  logout: () => void;
  getMe: (token: string) => any;
  addUser: (token: string, user: any) => any;
  deleteUser: (token: string, userId: string) => any;
  clearUser: () => void;
  changePassword: (token: string, data: any) => any;
  fetchUserById: (token: string, userId: string) => any;
}

export const useUserStore = create<UserState>()(
  (set) => ({
    userInfo: null,
    accessToken: '',
    userLoading: false,
    hasErrors: false,
    login: async (param: LoginParams) => {
      set({ userLoading: true });
      try {
        const response: any = await httpClient.post(authConfig.loginEndpoint as string, param);
        set({ userInfo: await response.data, userLoading: false, hasErrors: false });
        return await response.data;
      } catch (err) {
        set({ userLoading: false, hasErrors: true }, true);
        return false;
      }
    },
    logout: () => {
      set({ userInfo: null });
    },
    getMe: async (token: string) => {
      set({ userInfo: null, userLoading: true });
      try {
        const { data } = await httpClient.get(authConfig.meEndpoint as string, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ userInfo: { ...userInfo, data }, userLoading: false, hasErrors: false });
        return await data
      } catch (err) {
        set({ userInfo: null, userLoading: false, hasErrors: true });
        return null;
      }
    },
    async fetchUserById(token, userId) {
      try {
        const { data } = await httpClient.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return await data
      } catch (err) {
        return null;
      }
    },
    addUser: async (data: any) => {
      const response = await httpClient.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        data,
      });
      set({ userInfo: await response.data }, true);
    },
    deleteUser: async (id: number | string) => {
      const response = await httpClient.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
      set({ userInfo: await response.data }, true);
    },
    clearUser: () => {
      set({ userInfo: null }, true);
    },
    changePassword: async (token: string, data: any) => {
      set({ userLoading: true });
      try {
        await httpClient.put(`${authConfig.changePasswordEndpoint}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(async (response: any) => {
          const { data } = await response.data;
          set({ userInfo: await data, userLoading: false, hasErrors: false });
        });
      } catch (err) {
        set({ userInfo: data, userLoading: false, hasErrors: true }, true);
      }
    },
  }),
);