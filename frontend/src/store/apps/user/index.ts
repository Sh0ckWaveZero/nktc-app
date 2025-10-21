import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import { LoginParams, UserDataType } from '@/context/types';
import httpClient from '@/@core/utils/http';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ResetPasswordByAdminRequest,
  AuditLogParams,
  AuditLogsResponse,
  ApiError,
} from '@/types/apps/userTypes';

interface UserState {
  userInfo: UserDataType | null;
  userLoading: boolean;
  error: ApiError | null;
  login: (params: LoginParams) => Promise<UserDataType | null>;
  logout: () => void;
  getMe: () => Promise<UserDataType | null>;
  addUser: (user: any) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
  clearUser: () => void;
  changePassword: (data: ChangePasswordRequest) => Promise<ChangePasswordResponse>;
  fetchUserById: (userId: string) => Promise<UserDataType | null>;
  resetPasswordByAdmin: (data: ResetPasswordByAdminRequest) => Promise<any>;
  fetchAuditLogs: (body: AuditLogParams) => Promise<AuditLogsResponse>;
}

export const useUserStore = createWithEqualityFn<UserState>()((set) => ({
  userInfo: null,
  userLoading: false,
  error: null,
  login: async (param: LoginParams) => {
    set({ userLoading: true, error: null });
    try {
      const response = await httpClient.post(authConfig.loginEndpoint as string, param);
      const userData = response.data as UserDataType;
      set({ userInfo: userData, userLoading: false, error: null });
      return userData;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || 'Login failed',
        statusCode: err?.response?.status,
        error: err?.response?.data?.error,
      };
      set({ userLoading: false, error: apiError });
      return null;
    }
  },
  logout: () => {
    set({ userInfo: null, error: null });
  },
  getMe: async () => {
    set({ userLoading: true, error: null });
    try {
      const { data } = await httpClient.get(authConfig.meEndpoint as string);
      const userData = data as UserDataType;
      set({ userInfo: userData, userLoading: false, error: null });
      return userData;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || 'Failed to fetch user',
        statusCode: err?.response?.status,
      };
      set({ userInfo: null, userLoading: false, error: apiError });
      return null;
    }
  },
  async fetchUserById(userId: string) {
    set({ error: null });
    try {
      const { data } = await httpClient.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
      return data as UserDataType;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || 'Failed to fetch user',
        statusCode: err?.response?.status,
      };
      set({ error: apiError });
      return null;
    }
  },
  addUser: async (data: any) => {
    set({ error: null });
    try {
      const response = await httpClient.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, data);
      return response.data;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || 'Failed to create user',
        statusCode: err?.response?.status,
      };
      set({ error: apiError });
      throw apiError;
    }
  },
  deleteUser: async (id: string) => {
    set({ error: null });
    try {
      const response = await httpClient.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
      return response.data;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || 'Failed to delete user',
        statusCode: err?.response?.status,
      };
      set({ error: apiError });
      throw apiError;
    }
  },
  clearUser: () => {
    set({ userInfo: null, error: null });
  },
  changePassword: async (data: ChangePasswordRequest) => {
    set({ userLoading: true, error: null });
    try {
      const response = await httpClient.put(`${authConfig.changePasswordEndpoint}`, data);
      const result = response.data as ChangePasswordResponse;
      set({ userLoading: false, error: null });
      return result;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || 'Failed to change password',
        statusCode: err?.response?.status,
      };
      set({ userLoading: false, error: apiError });
      throw apiError;
    }
  },
  resetPasswordByAdmin: async (body: ResetPasswordByAdminRequest) => {
    set({ error: null });
    try {
      const { data } = await httpClient.put(`${authConfig.userEndpoint}/update/password/${body.teacher.id}`, body);
      return data;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || 'Failed to reset password',
        statusCode: err?.response?.status,
      };
      set({ error: apiError });
      throw apiError;
    }
  },
  fetchAuditLogs: async (params: AuditLogParams) => {
    set({ error: null });
    try {
      const { data } = await httpClient.get(
        `${authConfig.userEndpoint}/audit-logs/${params.userName}?skip=${params.skip || 0}&take=${params.take || 10}`,
      );
      return data as AuditLogsResponse;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || 'Failed to fetch audit logs',
        statusCode: err?.response?.status,
      };
      set({ error: apiError });
      // Return empty response instead of throwing for audit logs
      return { data: [], total: 0 };
    }
  },
}));
