import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';
import { LoginParams } from '@/context/types';
import shallow from 'zustand/shallow';

interface UserState {
  userInfo: any;
  accessToken: string;
  userLoading: boolean,
  hasErrors: boolean,
  login: (params: LoginParams) => any;
  logout: () => void;
  getMe: (token: string, username: string) => any;
  addUser: (token: string, user: any) => any;
  deleteUser: (token: string, userId: string) => any;
  clearUser: () => void;
  clearAccessToken: () => void;
  changePassword: (token: string, data: any) => any;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        userInfo: null,
        accessToken: '',
        userLoading: false,
        hasErrors: false,
        login: async (param: LoginParams) => {
          set({ userLoading: true });
          try {
            await axios.post(authConfig.loginEndpoint, param).then(async (response: any) => {
              const { data, token } = await response.data;
              set({ userInfo: await data, userLoading: false, hasErrors: false, accessToken: token });
            });
            return true;
          } catch (err) {
            set({ userLoading: false, hasErrors: true });
            return false;
          }
        },
        logout: () => {
          set({ userInfo: null, accessToken: '' });
        },
        getMe: async (token: string, username: string) => {
          set({ userInfo: null, userLoading: true });
          try {
            const { data } = await axios.get(authConfig.meEndpoint, {
              params: { username: username },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            set({ userInfo: data, userLoading: false, hasErrors: false });
            return await data
          } catch (err) {
            set({ userInfo: null, accessToken: '', userLoading: false, hasErrors: true });
            return null;
          }
        },
        addUser: async (data: any) => {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            data,
          });
          set({ userInfo: await response.data });
        },
        deleteUser: async (id: number | string) => {
          const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
          set({ userInfo: await response.data });
        },
        clearUser: () => {
          set({ userInfo: null });
        },
        clearAccessToken: () => {
          set({ accessToken: '' });
        },
        changePassword: async (token: string, data: any) => {
          set({ userLoading: true });
          try {
            await axios.put(`${authConfig.changePasswordEndpoint}`, data, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).then(async (response: any) => {
              const { data, token } = await response.data;
              set({ userInfo: await data, userLoading: false, hasErrors: false, accessToken: await token });
            });
          } catch (err) {
            set({ userInfo: data, userLoading: false, hasErrors: true });
          }
        },
        shallow,
      }),
      {
        name: 'user-storage',
      },
    ),
  ),
);