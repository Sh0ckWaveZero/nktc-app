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
  const { userInfo, loading, accessToken, logout } = useUserStore();
  const router = useRouter();

  useEffect(() => {
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
    }
  }, [router.route]);

  if (loading || !userInfo) {
    return fallback;
  }

  const decoded: any = jwt.decode(accessToken, { complete: true });
  if (decoded) {
    if (decoded.payload.exp < Date.now() / 1000) {
      logout();
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
