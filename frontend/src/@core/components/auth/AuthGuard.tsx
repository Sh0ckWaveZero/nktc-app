// ** React Imports
import { ReactNode, ReactElement, useEffect, useState } from 'react';

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
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check localStorage immediately
    const hasToken = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
    const hasUserData = typeof window !== 'undefined' ? window.localStorage.getItem('userData') : null;

    // If no token and no user data, redirect to login immediately
    if (!hasToken && !hasUserData) {
      console.log('🔒 No auth data found, redirecting to login...');
      if (pathname !== '/') {
        router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else {
        router.replace('/login');
      }
      return;
    }

    // If we have token/userData, wait for auth state to be ready
    if (!auth.loading && auth.isInitialized) {
      if (auth.user !== null) {
        setChecked(true);
      }
      // If auth.user is still null despite having a token, stay on spinner.
      // initAuth handles invalid/expired tokens via window.location.href = '/login'.
      // If we're here, the user state is being committed (e.g., React batching after login).
    }
  }, [pathname, auth.user, auth.loading, auth.isInitialized, router]);

  // Show fallback while checking or loading
  if (!checked || auth.loading || !auth.isInitialized || auth.user === null) {
    return fallback;
  }

  return <>{children}</>;
};

export default AuthGuard;
