// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react';

// ** Next Imports
import { useRouter } from 'next/router';

// ** Hooks Import
import { useUserStore } from '@/store/index';

interface AuthGuardProps {
  children: ReactNode;
  fallback: ReactElement | null;
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props;
  const { userInfo, loading } = useUserStore();
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

  return <>{children}</>;
};

export default AuthGuard;
