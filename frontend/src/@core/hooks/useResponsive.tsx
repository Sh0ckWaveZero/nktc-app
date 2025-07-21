'use client';

import { useState, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Custom hook for responsive breakpoints that handles SSR properly
 * Prevents hydration mismatch between server and client
 */
export const useResponsive = () => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  // Media queries
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.down('lg'));
  const isLarge = useMediaQuery(theme.breakpoints.down('xl'));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return default values during SSR to prevent hydration mismatch
  if (!mounted) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      isLarge: false,
      mounted: false,
    };
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    mounted: true,
  };
};

/**
 * Hook specifically for layout hiding logic
 */
export const useLayoutBreakpoint = () => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const hidden = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    hidden: mounted ? hidden : false,
    mounted,
  };
};