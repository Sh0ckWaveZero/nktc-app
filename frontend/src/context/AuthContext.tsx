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
import jwt from 'jsonwebtoken';

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
  const { userInfo, accessToken, login, logout, getMe, userLoading } = useUserStore();

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      console.log('initAuth');
      setIsInitialized(true);

      const decoded: any = jwt.decode(accessToken, { complete: true });
      if (decoded) {
        if (decoded.payload.exp < Date.now() / 1000) {
          console.log('token expired');
          return handleLogout();
        }

        if (userInfo) {
          setUser(userInfo);
          setLoading(userLoading);
        } else {
          await getMe(accessToken, userInfo?.username);
          setUser(userInfo);
          setLoading(userLoading);
        }
      }

      // if (accessToken) {
      //   setLoading(userLoading);
      //   const decoded: any = jwt.decode(accessToken, { complete: true });
      //   if (decoded) {
      //     if (decoded.payload.exp < Date.now() / 1000) {
      //       handleLogout();
      //     }

      //     if (userInfo) {
      //       setUser(userInfo);
      //       setLoading(userLoading);
      //     } else {
      //       await getMe(accessToken, userInfo?.username);
      //       setUser(userInfo);
      //       setLoading(userLoading);
      //     }
      //   }

      //   // await axios
      //   //   .get(authConfig.meEndpoint, {
      //   //     headers: {
      //   //       Authorization: storedToken,
      //   //     },
      //   //   })
      //   //   .then(async (response) => {
      //   //     setLoading(false);
      //   //     setUser({ ...response.data.userData });
      //   //   })
      //   //   .catch(() => {
      //   //     localStorage.removeItem('userData');
      //   //     localStorage.removeItem('refreshToken');
      //   //     localStorage.removeItem('accessToken');
      //   //     setUser(null);
      //   //     setLoading(false);
      //   //   });
      // } else {
      //   setLoading(userLoading);
      // }
    };
    initAuth();
  }, []);

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
