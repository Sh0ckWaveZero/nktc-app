'use client';

import { ReactNode, useContext } from 'react';

// ** Emotion Imports
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// ** Component Imports
import ThemeComponent from '@/@core/theme/ThemeComponent';
import WindowWrapper from '@/@core/components/window-wrapper';

// ** Contexts
import { AuthProvider, AuthContext } from '@/context/AuthContext';
import { SettingsProvider } from '@/@core/context/settingsContext';
import { useSettings } from '@/@core/hooks/useSettings';

// ** ACL Imports
import { AbilityContext } from '@/layouts/components/acl/Can';
import { buildAbilityFor } from '@/configs/acl';

// ** Utils Imports
import { createEmotionCache } from '@/@core/utils/create-emotion-cache';

// ** Axios Interceptor
import { AxiosInterceptor } from '@/@core/utils/http';

// ** Toast
import ReactHotToast from '@/@core/styles/libs/react-hot-toast';
import { Toaster } from 'react-hot-toast';

// ** Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css';

const clientSideEmotionCache = createEmotionCache();

interface ProvidersProps {
  children: ReactNode;
  emotionCache?: EmotionCache;
}

// ** ACL Provider Component
const ACLProvider = ({ children }: { children: ReactNode }) => {
  let auth;

  try {
    auth = useContext(AuthContext);
  } catch (error) {
    // Context is not available during static generation
    auth = null;
  }

  // Handle case where context might be null during static generation or client-side only
  const ability = auth?.user?.role ? buildAbilityFor(auth.user.role, 'all') : buildAbilityFor('guest', 'all');

  return (
    // @ts-expect-error - React 19 compatibility issue with CASL
    <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
  );
};

// ** Settings Inner Provider Component
const SettingsInnerProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();

  return (
    <ThemeComponent settings={settings}>
      <WindowWrapper>
        {children}
        <ReactHotToast>
          <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
        </ReactHotToast>
      </WindowWrapper>
    </ThemeComponent>
  );
};

export default function Providers({ children, emotionCache = clientSideEmotionCache }: ProvidersProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <CacheProvider value={emotionCache}>
        <AuthProvider>
          <ACLProvider>
            <AxiosInterceptor>
              <SettingsProvider>
                <SettingsInnerProvider>
                  {children}
                </SettingsInnerProvider>
              </SettingsProvider>
            </AxiosInterceptor>
          </ACLProvider>
        </AuthProvider>
      </CacheProvider>
    </AppRouterCacheProvider>
  );
}
