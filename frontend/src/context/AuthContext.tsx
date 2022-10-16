// ** React Imports
import { createContext, useState, ReactNode } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** Axios
import axios from 'axios';

// ** Config
import authConfig from '@/configs/auth';

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types';
import { useUserStore } from '@/store/index';

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
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user);
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading);
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultProvider.isInitialized);

  // ** Hooks
  const router = useRouter();
  const { login, logout } = useUserStore();
  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    login(params)
      .then((request: any) => {
        if (request) {
          const returnUrl = router.query.returnUrl;
          const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/';
          router.replace(redirectURL as string);
        } else {
          if (errorCallback) errorCallback({ message: 'Unauthorized' });
        }
      })
      .catch((err: any) => {
        if (errorCallback) errorCallback(err);
      });
  };

  const handleLogout = () => {
    setUser(null);
    setIsInitialized(false);
    logout();
    router.push('/login');
  };

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.registerEndpoint, params)
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
