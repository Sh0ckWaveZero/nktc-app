// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react';

// ** Next Imports
import { useRouter } from 'next/router';

// ** Hooks Import
import { useUserStore } from '@/store/index';

// ** JWT import
import jwt from 'jsonwebtoken';

interface AuthGuardProps {
  children: ReactNode;
  fallback: ReactElement | null;
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props;
  const { userInfo, userLoading: loading, accessToken, logout } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const decoded: any = jwt.decode(accessToken, { complete: true });
    if (!router.isReady) {
      return;
    }

    if (!userInfo) {
      if (router.asPath !== '/') {
        router.replace({
          pathname: '/login',
          query: { returnUrl: router.asPath },
        });
      } else {
        router.replace('/login');
      }
    } else {
      if (decoded) {
        if (decoded?.payload.exp < Date.now() / 1000) {
          logout();
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath },
          });
        }
      }
    }
  }, [router.route]);

  if (loading || !userInfo) {
    return fallback;
  }

  return <>{children}</>;
};

export default AuthGuard;
