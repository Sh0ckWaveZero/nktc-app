import React, { FC } from 'react'
import { isClient } from '@/utils/index';
import { useRouter } from 'next/router';
import { isAuthenticatedSelector, isAuthentingSelector } from '@/store/slices/userSlice';
import { useSelector } from 'react-redux';

export const WithAuth = (WrappedComponent: FC) => (props: any) => {
  if (isClient()) {
    const router = useRouter();
    const { route } = router;;
    const isAuthunticated = useSelector(isAuthenticatedSelector);
    const isAuthticating = useSelector(isAuthentingSelector);
    console.log('isAuthunticated', isAuthunticated);
    console.log('isAuthticating', isAuthticating);

    // is fetching session
    if (!isAuthticating) {
      return null;
    }

    // is not authenticated return to login page
    if (route !== '/login') {
      if (!isAuthunticated) {
        router.push('/login');
        return null;
      }
      else if (route === '/') {
        // router.push('/dashboard');
        router.push('/');
        return null;
      }
    } else {
      if (isAuthunticated) {
        // default redirect  after login
        router.push('/');
        return null;
      }
    }
    return (
      // is authenticated
      <WrappedComponent {...props} />
    )
  }
  return null;
}