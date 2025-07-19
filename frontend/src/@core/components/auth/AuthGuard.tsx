// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react';

// ** Next Imports
import { useRouter, usePathname } from 'next/navigation';

// ** Hooks Import
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  fallback: ReactElement | null;
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props;
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(
    () => {
      if (auth.user === null && !window.localStorage.getItem('userData')) {
        if (pathname !== '/') {
          router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        } else {
          router.replace('/login');
        }
      }
    },
    [pathname, auth.user, router],
  );

  if (auth.loading || auth.user === null) {
    return fallback;
  }

  return <>{children}</>;
};

export default AuthGuard;
