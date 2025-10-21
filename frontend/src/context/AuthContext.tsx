'use client';

// ** React Imports
import * as React from 'react';
import { createContext, useEffect, useState } from 'react';

// ** Next Import
import { useRouter, useSearchParams } from 'next/navigation';

// ** Config
import { authConfig } from '@/configs/auth';

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types';

import { LocalStorageService } from '@/services/localStorageService';
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
const localStorageService = new LocalStorageService();

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
  const searchParams = useSearchParams();

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  const storedToken = localStorageService.getToken();
  useEffect(() => {
    // Only run auth initialization in browser environment
    if (!isBrowser) {
      setIsInitialized(true);
      setLoading(false);
      return;
    }

      const initAuth = async (): Promise<void> => {
        setIsInitialized(true);
        if (storedToken) {
          setLoading(true);
          await httpClient
            .get(authConfig.meEndpoint as string)
            .then(async (response) => {
              const { data } = response;
              setLoading(false);
              setUser({ ...(await data) });
            })
            .catch((_) => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('userData');
                localStorage.removeItem('refreshToken');
              }
              localStorageService.removeToken();
              setUser(null);
              setLoading(false);
              router.replace('/login');
            });
        } else {
          setLoading(false);
        }
      };
      initAuth();
  }, []);

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    try {
      const response = await httpClient.post(authConfig.loginEndpoint as string, params);
      const { data } = response;

      // Save token
      localStorageService.setToken(data.token);

      // Save user data
      if (isBrowser) {
        window.localStorage.setItem('userData', JSON.stringify(data));
      }

      // Set user state
      setUser(data?.data);

      // Redirect after setting user
      if (isBrowser) {
        const returnUrl = searchParams.get('returnUrl');
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/home';
        router.replace(redirectURL as string);
      }
    } catch (err: any) {
      if (errorCallback) errorCallback(err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsInitialized(false);
    if (isBrowser) {
      window.localStorage.removeItem('userData');
      router.push('/login');
    }
    localStorageService.removeToken();
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
