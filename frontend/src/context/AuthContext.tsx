'use client';

// ** React Imports
import * as React from 'react';
import { createContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

// ** Next Import
import { useRouter } from 'next/navigation';

// ** Config
import { authConfig } from '@/configs/auth';

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types';

import httpClient from '@/@core/utils/http';

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  isInitialized: false,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  setIsInitialized: () => Boolean,
  register: () => Promise.resolve(),
};

const AuthContext = createContext(defaultProvider);

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user as UserDataType);
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading);
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultProvider.isInitialized);

  // ** Hooks
  const router = useRouter();
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    // Only run auth initialization in browser environment
    if (!isBrowser) {
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    const storedToken = localStorage.getItem('accessToken');
    const storedUserData = localStorage.getItem('userData');

    const initAuth = async (): Promise<void> => {
      setIsInitialized(true);

      if (storedToken) {
        setLoading(true);

        // First, restore user from localStorage if available
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            const restoredUser = userData?.data || userData;
            setUser(restoredUser);
          } catch {
            // Failed to parse stored user data, will be cleared on /me fetch failure
          }
        }

        // Then verify token with backend
        await httpClient
          .get(authConfig.meEndpoint as string)
          .then(async (response) => {
            setLoading(false);
            // Update user with fresh data from backend
            setUser(response.data?.data || response.data);
            // Also update localStorage with fresh data
            window.localStorage.setItem('userData', JSON.stringify(response.data));
          })
          .catch(() => {
            // Token is invalid, clear everything
            localStorage.removeItem('userData');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('accessToken');
            setUser(null);
            setLoading(false);
            // Force redirect immediately
            window.location.href = '/login';
          });
      } else {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrowser]);

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    try {
      const response = await httpClient.post(authConfig.loginEndpoint as string, params);
      const { data } = response;

      // Save token
      if (isBrowser) {
        window.localStorage.setItem('accessToken', data.token);
        // Save user data
        window.localStorage.setItem('userData', JSON.stringify(data));
      }

    // Force synchronous state commit so auth.user is available before router.replace fires
    flushSync(() => {
      setUser(data?.data);
    });
    
    // Return user data for success handling in components
    return data?.data;
  } catch (err: any) {
    if (errorCallback) errorCallback(err);
    throw err;
  }
};

  const handleLogout = async () => {
    try {
      if (authConfig.logoutEndpoint) {
        await httpClient.post(authConfig.logoutEndpoint);
      }
    } catch {
      // Proceed with logout even if API call fails
    } finally {
      setUser(null);
      setIsInitialized(false);
      if (isBrowser) {
        window.localStorage.removeItem('userData');
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('refreshToken');
        router.push('/login');
      }
    }
  };

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    httpClient
      .post(authConfig.registerEndpoint as string, params)
      .then((res) => {
        if (res.data.error) {
          if (errorCallback) errorCallback(res.data.error);
        } else {
          handleLogin({ username: params.username, password: params.password });
        }
      })
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null));
  };

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    isInitialized,
    setIsInitialized,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
