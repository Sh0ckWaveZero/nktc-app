// ** React Imports
import { useEffect } from 'react';

// ** Next Imports
import { useRouter } from 'next/router';

// ** Spinner Import
import Spinner from '@/@core/components/spinner';

// ** Hook Imports
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/index';

/**
 *  Set Home URL based on User Roles
 */
export const getHomeRoute = (role: string) => {
  if (role === 'client') return '/acl';
  else return '/home';
};

const Home = () => {
  // ** Hooks
  // const auth = useAuth();
  const { userInfo } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (userInfo && userInfo.role) {
      const homeRoute = getHomeRoute(userInfo.role);

      // Redirect user to Home URL
      router.replace(homeRoute);
    }
  }, []);

  return <Spinner />;
};

export default Home;
