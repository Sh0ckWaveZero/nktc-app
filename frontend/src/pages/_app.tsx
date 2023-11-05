// ** React Imports
import { ReactNode } from 'react';

// ** Next Imports
import Head from 'next/head';
import { Router } from 'next/router';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

// ** Loader Import
import NProgress from 'nprogress';

// ** Emotion Imports
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';

// ** Config Imports

import { defaultACLObj } from '@/configs/acl';
import themeConfig from '@/configs/themeConfig';

// ** Component Imports
import UserLayout from '@/layouts/UserLayout';
import AclGuard from '@/@core/components/auth/AclGuard';
import ThemeComponent from '@/@core/theme/ThemeComponent';
import AuthGuard from '@/@core/components/auth/AuthGuard';
import GuestGuard from '@/@core/components/auth/GuestGuard';
import WindowWrapper from '@/@core/components/window-wrapper';

// ** Spinner Import
import Spinner from '@/@core/components/spinner';

// ** Contexts
import { AuthProvider } from '@/context/AuthContext';
import { SettingsConsumer, SettingsProvider } from '@/@core/context/settingsContext';

// ** Utils Imports
import { createEmotionCache } from '@/@core/utils/create-emotion-cache';

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css';

// ** Global css styles
import '../styles/globals.css';
import { AxiosInterceptor } from '@/@core/utils/http';
import ReactHotToast from '@/@core/styles/libs/react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { LocalStorageProvider } from '@/context/LocalStorageContext';

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage;
  emotionCache: EmotionCache;
};

type GuardProps = {
  authGuard: boolean;
  guestGuard: boolean;
  children: ReactNode;
};

const clientSideEmotionCache = createEmotionCache();

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start();
  });
  Router.events.on('routeChangeError', () => {
    NProgress.done();
  });
  Router.events.on('routeChangeComplete', () => {
    NProgress.done();
  });
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>;
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>;
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>;
  }
};

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  // Variables
  const getLayout = Component.getLayout ?? ((page) => <UserLayout>{page}</UserLayout>);

  const setConfig = Component.setConfig ?? undefined;

  const authGuard = Component.authGuard ?? true;

  const guestGuard = Component.guestGuard ?? false;

  const aclAbilities = Component.acl ?? defaultACLObj;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{`${themeConfig.templateName} - ระบบดูแลช่วยเหลือนักเรียน`}</title>
        <meta name='description' content={`${themeConfig.templateName} - ระบบดูแลช่วยเหลือนักเรียน`} />
        <meta name='keywords' content={themeConfig.templateName} />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <LocalStorageProvider>
        <AuthProvider>
          <AxiosInterceptor>
            <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={settings}>
                      <WindowWrapper>
                        <Guard authGuard={authGuard} guestGuard={guestGuard}>
                          <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard}>
                            {getLayout(<Component {...pageProps} />)}
                          </AclGuard>
                        </Guard>
                      </WindowWrapper>
                      <ReactHotToast>
                        <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
                      </ReactHotToast>
                    </ThemeComponent>
                  );
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </AxiosInterceptor>
        </AuthProvider>
      </LocalStorageProvider>
    </CacheProvider>
  );
};

export default App;
