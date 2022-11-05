// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** Axios
import httpClient from '@/@core/utils/http';

// ** Config
import { authConfig } from '@/configs/auth';

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType } from './types';

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
  children: ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user);
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading);
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultProvider.isInitialized);

  // ** Hooks
  const router = useRouter();

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      setIsInitialized(true);
      const storedToken = localStorage.getItem(authConfig.accessToken as string)!;
      if (storedToken) {
        setLoading(true);
        await httpClient
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
          .catch(() => {
            localStorage.removeItem('userData');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('accessToken');
            setUser(null);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    httpClient
      .post(authConfig.loginEndpoint as string, params)
      .then(async (res) => {
        window.localStorage.setItem(authConfig.accessToken as string, res.data.token);
      })
      .then(() => {
        httpClient
          .get(authConfig.meEndpoint as string, {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem(authConfig.accessToken as string)!}`,
            },
          })
          .then(async (response) => {
            const { data } = response;
            const returnUrl = router.query.returnUrl;
            setUser({ ...(await data) });
            await window.localStorage.setItem('userData', JSON.stringify(data));
            const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/';
            router.replace(redirectURL as string);
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
    window.localStorage.removeItem(authConfig.accessToken as string);
    router.push('/login');
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
