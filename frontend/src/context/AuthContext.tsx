import axios from 'axios';
import { useRouter } from 'next/router';
import { ReactNode, createContext, useEffect, useState } from 'react';

import { authConfig } from '@/configs/auth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AuthValuesType, ErrCallbackType, LoginParams, RegisterParams, UserDataType } from './types';

// ** Defaults
const defaultProvider: AuthValuesType = {
  isInitialized: false,
  loading: true,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  setIsInitialized: () => Boolean,
  setLoading: () => Boolean,
  setUser: () => null,
  user: null,
};

const AuthContext = createContext(defaultProvider);

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
  const useLocal = useLocalStorage();

  const storedToken = useLocal.getToken();
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
            useLocal.removeToken();
            setUser(null);
            setLoading(false);
            router.replace('/login');
          });
      } else {
        handleLogout();
      }
    };
    initAuth();
  }, []);

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    try {
      const response = await axios.post(authConfig.loginEndpoint as string, params);
      const { data } = response;
      useLocal.setToken(data?.access_token);
      const returnUrl = router.query.returnUrl;
      setUser(await data?.data);
      window.localStorage.setItem('userData', JSON.stringify(data));
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/';
      router.replace(redirectURL as string);
    } catch (err: any) {
      if (errorCallback) errorCallback(err);
    }
  };

  const handleLogout = () => {
    setLoading(false);
    setUser(null);
    setIsInitialized(false);
    window.localStorage.removeItem('userData');
    useLocal.removeToken();
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
