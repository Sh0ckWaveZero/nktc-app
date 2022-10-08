// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** Axios
import axios from 'axios';

// ** Config
import authConfig from '@/configs/auth';

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types';
import { useUserStore } from '@/store/index';
import { useEffectOnce } from '@/hooks/userCommon';
import jwt from 'jsonwebtoken'

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
  // user: any;
  // accessToken: string;
  // loading: boolean,
  // hasErrors: boolean,
  // login: (params: LoginParams) => any;
  // logout: () => void;
  // getMe: (token: string) => any;
  // addUser: (token: string, user: any) => any;
  // deleteUser: (token: string, userId: string) => any;
  const { userInfo, accessToken, hasErrors, login, logout, getMe } = useUserStore();



  // useEffect(() => {
  //   const initAuth = async (): Promise<void> => {
  //     setIsInitialized(true);
  //     const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!;
  //     if (storedToken) {
  //       setLoading(true);
  //       await axios
  //         .get(authConfig.meEndpoint, {
  //           headers: {
  //             Authorization: `Bearer ${storedToken}`,
  //           },
  //         })
  //         .then((response) => {
  //           const { data } = response;
  //           setLoading(false);
  //           setUser({ ...data });
  //         })
  //         .catch(() => {
  //           localStorage.removeItem('userData');
  //           localStorage.removeItem('refreshToken');
  //           localStorage.removeItem('accessToken');
  //           setUser(null);
  //           setLoading(false);
  //         });
  //     } else {
  //       setLoading(false);
  //     }
  //   };
  //   initAuth();
  // }, []);

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    // axios
    //   .post(authConfig.loginEndpoint, params)
    //   .then(async (response: any) => {
    //     const { data, token } = await response.data;

    //     window.localStorage.setItem(authConfig.storageTokenKeyName, token);

    //     const returnUrl = router.query.returnUrl;

    //     setUser({ ...data });

    //     window.localStorage.setItem('userData', JSON.stringify(data));

    //     const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/';

    //     router.replace(redirectURL as string);
    //   })

    //   .catch((err) => {
    //     if (errorCallback) errorCallback(err);
    //   });

    login(params)
      .then((res: any) => {
        console.log('🚀 ~ file: AuthContext.tsx ~ line 120 ~ .then ~ res', userInfo);
        setUser(userInfo);
        const returnUrl = router.query.returnUrl;
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/';
        router.replace(redirectURL as string);
      })
      .catch((err: any) => {
        if (errorCallback) errorCallback(err);
      });
  };

  const handleLogout = () => {
    setUser(null);
    setIsInitialized(false);
    // window.localStorage.removeItem('userData');
    // window.localStorage.removeItem(authConfig.storageTokenKeyName);
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
