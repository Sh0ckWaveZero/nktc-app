// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react';

// ** Next Imports
import { useRouter } from 'next/navigation';

// ** Hooks Import
import { useAuth } from '@/hooks/useAuth';

interface GuestGuardProps {
  children: ReactNode;
  fallback: ReactElement | null;
}

const GuestGuard = (props: GuestGuardProps) => {
  const { children, fallback } = props;
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (window.localStorage.getItem('userData')) {
      router.replace('/');
    }
  }, [router]);

  if (auth.loading || (!auth.loading && auth.user !== null)) {
    return fallback;
  }

  return <>{children}</>;
};

export default GuestGuard;
