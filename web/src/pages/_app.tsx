// ** Next Imports
import Head from 'next/head';
import {Router} from 'next/router';
import type {NextPage} from 'next';
import type {AppProps} from 'next/app';

// ** Loader Import
import NProgress from 'nprogress';

// ** Emotion Imports
import {CacheProvider} from '@emotion/react';
import type {EmotionCache} from '@emotion/cache';

// ** Config Imports
import themeConfig from 'src/configs/themeConfig';

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout';
import ThemeComponent from 'src/@core/theme/ThemeComponent';

// ** Contexts
import {SettingsConsumer, SettingsProvider} from 'src/@core/context/settingsContext';

// ** Utils Imports
import {createEmotionCache} from 'src/@core/utils/create-emotion-cache';

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css';

// ** Global css styles
import '../../styles/globals.css';
import {Provider} from "react-redux";
import {store} from "@/store/store";
import {getSession} from "@/store/slices/userSlice";
import React, {useEffect} from "react";

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage;
  emotionCache: EmotionCache;
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

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  // update session & set token
  useEffect(() => {
    store.dispatch(getSession());
  }, [])
  const {Component, emotionCache = clientSideEmotionCache, pageProps} = props;

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>);

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{`${themeConfig.templateName} - ${process.env.NEXT_PUBLIC_TITLE}`}</title>
          <meta
            name='description'
            content={`${themeConfig.templateName}`}
          />
          <meta name='keywords' content={process.env.NEXT_PUBLIC_APP_NAME}/>
          <meta name='viewport' content='initial-scale=1, width=device-width'/>
        </Head>

        <SettingsProvider>
          <SettingsConsumer>
            {({settings}) => {
              return <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>;
            }}
          </SettingsConsumer>
        </SettingsProvider>

      </CacheProvider>
    </Provider>
  );
};

export default App;
