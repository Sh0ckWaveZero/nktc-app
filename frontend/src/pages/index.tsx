// ** React Imports
import { useEffect } from 'react';

// ** Next Imports
import { useRouter } from 'next/router';

// ** Spinner Import
import Spinner from '@/@core/components/spinner';

// ** Hook Imports
// import { useUserStore } from '@/store/index';
import { useAuth } from '@/hooks/useAuth';

/**
 *  Set Home URL based on User Roles
 */
export const getHomeRoute = (role: string) => {
  if (role === 'Teacher') return '/home';
  if (role === 'Student') return '/apps/student/overview';
  else return '/home';
};

const Home = () => {
  // ** Hooks
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (auth.user && auth.user.role) {
      const homeRoute = getHomeRoute(auth.user.role);

      // Redirect user to Home URL
      router.replace(homeRoute);
    }
  }, []);

  return <Spinner />;
};

export default Home;
