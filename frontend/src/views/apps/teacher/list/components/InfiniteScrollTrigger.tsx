'use client';

import { Box, CircularProgress } from '@mui/material';
import React, { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  isLoading: boolean;
}

const InfiniteScrollTrigger = ({ onLoadMore, isLoading }: InfiniteScrollTriggerProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!triggerRef.current) return;

    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before reaching the trigger
        threshold: 0.1,
      }
    );

    observerRef.current.observe(triggerRef.current);

    return () => {
      if (observerRef.current && triggerRef.current) {
        observerRef.current.unobserve(triggerRef.current);
      }
    };
  }, [onLoadMore, isLoading]);

  return (
    <Box
      ref={triggerRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 3,
        minHeight: 60,
      }}
    >
      {isLoading && <CircularProgress size={24} />}
    </Box>
  );
};

export default InfiniteScrollTrigger;

