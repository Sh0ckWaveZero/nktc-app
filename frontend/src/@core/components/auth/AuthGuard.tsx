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

  useEffect(() => {
    // Only redirect if initialization is complete and still no user
    if (!auth.loading && auth.isInitialized) {
      const hasToken = window.localStorage.getItem('accessToken');
      const hasUserData = window.localStorage.getItem('userData');

      // If no token and no user data, redirect to login
      if (!hasToken && !hasUserData && auth.user === null) {
        if (pathname !== '/') {
          router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        } else {
          router.replace('/login');
        }
      }
    }
  }, [pathname, auth.user, auth.loading, auth.isInitialized, router]);

  // Show fallback while loading or initializing
  if (auth.loading || !auth.isInitialized || auth.user === null) {
    return fallback;
  }

  return <>{children}</>;
};

export default AuthGuard;
