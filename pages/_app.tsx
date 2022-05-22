import Head from 'next/head';
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { userService } from '../services';
import '../styles/globals.css'
import { Provider } from 'react-redux';
import { store } from '@/store/index';

const MyApp = ({ Component, pageProps }: AppProps) => {

  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // run auth check on initial load
    authCheck(router.asPath);

    // set authorized to false to hide page content while changing routes
    const hideContent = () => setAuthorized(false);
    router.events.on('routeChangeStart', hideContent);

    // run auth check on route change
    router.events.on('routeChangeComplete', authCheck)

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent);
      router.events.off('routeChangeComplete', authCheck);
    }
  }, []);


  const authCheck = (url: string) => {
    // userService.logout();
    // redirect to login page if accessing a private page and not logged in 
    const publicPaths = ['/login'];
    const path = url.split('?')[0];
    if (!userService.userValue && !publicPaths.includes(path)) {
      console.log('redirect to login');
      setAuthorized(false);
      router.push({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      });
    } else {
      setAuthorized(true);
    }
  }

  return (
    <Provider store={store}>
      <>
        <Head>
          <title>NKTC-App ระบบดูแลช่วยเหลือนักเรียนสำหรับวิทยาลัยเทคนิคหนองคาย</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai&display=swap" rel="stylesheet" />
        </Head>

        {authorized &&
          <Component {...pageProps} />
        }

      </>
    </Provider>
  );
}

export default MyApp
