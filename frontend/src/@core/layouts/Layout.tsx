'use client';

// ** React Import
import { useEffect, useRef, useState } from 'react';

// ** Type Import
import { LayoutProps } from '@/@core/layouts/types';

// ** Layout Components
import VerticalLayout from './VerticalLayout';
import HorizontalLayout from './HorizontalLayout';

const Layout = (props: LayoutProps) => {
  // ** Props
  const { hidden, children, settings, saveSettings } = props;

  // ** State to prevent double rendering
  const [mounted, setMounted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // ** Ref
  const isCollapsed = useRef(settings.navCollapsed);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hasInitialized) return;

    if (hidden) {
      if (settings.navCollapsed) {
        saveSettings({ ...settings, navCollapsed: false, layout: 'vertical' });
        isCollapsed.current = true;
      } else {
        saveSettings({ ...settings, layout: 'vertical' });
      }
    } else {
      if (isCollapsed.current) {
        saveSettings({
          ...settings,
          navCollapsed: true,
          layout: settings.lastLayout,
        });
        isCollapsed.current = false;
      } else {
        saveSettings({ ...settings, layout: settings.lastLayout });
      }
    }

    setHasInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, mounted]);

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  if (settings.layout === 'horizontal') {
    return <HorizontalLayout {...props}>{children}</HorizontalLayout>;
  }

  return <VerticalLayout {...props}>{children}</VerticalLayout>;
};

export default Layout;
