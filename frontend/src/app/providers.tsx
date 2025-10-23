'use client';

import { ReactNode, useContext, useState, useEffect } from 'react';

// ** Emotion Imports
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// ** React Query Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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

// ** Client-only component for React Query DevTools
const ClientOnlyDevTools = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={false} position='bottom' />;
};

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

  // Type assertion to handle React 19 compatibility with CASL
  const Provider = AbilityContext.Provider as React.ComponentType<{ value: any; children: ReactNode }>;

  return (
    <Provider value={ability}>{children}</Provider>
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
  // Create QueryClient instance with optimized defaults
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute - data is considered fresh
            gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnReconnect: true, // Refetch on network reconnect
            retry: 1, // Retry failed requests once
          },
          mutations: {
            retry: 1, // Retry failed mutations once
          },
        },
      })
  );

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <CacheProvider value={emotionCache}>
        <QueryClientProvider client={queryClient}>
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
          {/* React Query DevTools - only in development */}
          {process.env.NODE_ENV === 'development' && <ClientOnlyDevTools />}
        </QueryClientProvider>
      </CacheProvider>
    </AppRouterCacheProvider>
  );
}
