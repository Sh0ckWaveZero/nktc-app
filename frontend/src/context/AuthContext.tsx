// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** Axios
import axios from 'axios';

// ** Config
import { authConfig } from '@/configs/auth';

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types';

import { LocalStorageService } from '@/services/localStorageService';

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
  children: ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user as UserDataType);
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading);
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultProvider.isInitialized);

  // ** Hooks
  const router = useRouter();

  const storedToken = localStorageService.getToken()!;
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      setIsInitialized(true);
      if (storedToken) {
        setLoading(true);
        await axios
          .get(authConfig.meEndpoint as string, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          })
          .then(async (response) => {
            const { data } = response;
            setLoading(false);
            setUser({ ...(await data) });
          })
          .catch((_) => {
            localStorage.removeItem('userData');
            localStorage.removeItem('refreshToken');
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

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.loginEndpoint as string, params)
      .then(async (res) => {
        localStorageService.setToken(res.data.token);
      })
      .then(() => {
        axios
          .get(authConfig.meEndpoint as string, {
            headers: {
              Authorization: `Bearer ${localStorageService.getToken()!}`,
            },
          })
          .then(async (response) => {
            if (response) {
              const { data } = response;
              const returnUrl = router.query.returnUrl;
              setUser({ ...(await data) });
              window.localStorage.setItem('userData', JSON.stringify(data));
              const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/';
              router.replace(redirectURL as string);
            }
          })
          .catch((err) => {
            if (errorCallback) errorCallback(err);
          });
      })
      .catch((err) => {
        if (errorCallback) errorCallback(err);
      });
  };

  const handleLogout = () => {
    setUser(null);
    setIsInitialized(false);
    window.localStorage.removeItem('userData');
    localStorageService.removeToken();
    router.push('/login');
  };

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    axios
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
