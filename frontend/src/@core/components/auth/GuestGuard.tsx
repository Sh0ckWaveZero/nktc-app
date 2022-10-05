// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react';

// ** Next Imports
import { useRouter } from 'next/router';

// ** Hooks Import
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/index';

interface GuestGuardProps {
  children: ReactNode;
  fallback: ReactElement | null;
}

const GuestGuard = (props: GuestGuardProps) => {
  const { children, fallback } = props;
  // const auth = useAuth();
  const { userInfo, loading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (userInfo) {
      router.replace('/');
    }
  }, [router.route]);

  if (loading || (!loading && userInfo !== null)) {
    return fallback;
  }

  return <>{children}</>;
};

export default GuestGuard;
