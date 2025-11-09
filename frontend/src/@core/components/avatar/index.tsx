import { Box } from '@mui/material';
import { useState, memo, useMemo, useRef, useEffect } from 'react';
import CustomAvatar from '@/@core/components/mui/avatar';
import { getInitials } from '@/@core/utils/get-initials';
import { getAvatarColor } from '@/@core/utils/get-avatar-color';

interface RenderAvatarProps {
  row: any;
  customStyle?: any;
}


const RenderAvatar = memo((props: RenderAvatarProps) => {
  const {
    row,
    customStyle = {
      mr: 3,
      width: 40,
      height: 40,
    },
  } = props;

  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoize avatar URL and initials
  const avatarUrl = useMemo(() => row?.avatar || '', [row?.avatar]);
  const initials = useMemo(
    () => getInitials((row?.firstName || '') + ' ' + (row?.lastName || '')),
    [row?.firstName, row?.lastName]
  );
  
  // Get avatar color from theme - use row.avatarColor if provided, otherwise generate from ID/name
  const avatarColor = useMemo(() => {
    if (row?.avatarColor) {
      return row.avatarColor;
    }
    // Generate color based on ID or name for consistency
    return getAvatarColor(row?.id || row?.studentId, row?.firstName + ' ' + row?.lastName);
  }, [row?.avatarColor, row?.id, row?.studentId, row?.firstName, row?.lastName]);

  // Normalize URL - use Next.js API route for caching when possible
  // Also check client-side cache to prevent duplicate requests
  const normalizedUrl = useMemo(() => {
    if (!avatarUrl) return null;
    
    // Allow data URLs
    if (avatarUrl.startsWith('data:image/')) return avatarUrl;
    
    // Extract statics path from URL
    let staticsPath: string | null = null;
    
    // Handle relative URLs
    if (avatarUrl.startsWith('/statics/')) {
      staticsPath = avatarUrl.replace('/statics/', '');
    }
    // Handle absolute URLs
    else {
      try {
        const urlObj = new URL(avatarUrl);
        if (urlObj.pathname.startsWith('/statics/')) {
          staticsPath = urlObj.pathname.replace('/statics/', '');
        } else if (urlObj.pathname.startsWith('/api/statics/')) {
          staticsPath = urlObj.pathname.replace('/api/statics/', '');
        }
      } catch {
        // If parsing fails, continue with original URL
      }
    }
    
    // If we found a statics path, use Next.js API route for caching
    if (staticsPath) {
      const proxyUrl = `/api/avatar-proxy/statics/${staticsPath}`;
      
      // Use browser's native caching instead of manual cache
      // The API route sets Cache-Control headers, so browser will handle caching
      // We only track failed requests to prevent spam retries
      return proxyUrl;
    }
    
    // Fallback to original URL handling
    if (avatarUrl.startsWith('/')) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      if (avatarUrl.startsWith('/statics/') && API_URL) {
        const baseUrl = API_URL.endsWith('/api') ? API_URL : API_URL;
        return `${baseUrl}${avatarUrl}`;
      }
      return avatarUrl;
    }
    
    // Use absolute URL as-is for other cases
    return avatarUrl;
  }, [avatarUrl]);

  // Reset states when avatar changes
  useEffect(() => {
    // Cleanup previous timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Reset states when avatar URL changes
    setImageError(false);
    setImageLoaded(false);
    setRetryCount(0);
    setIsInView(false); // Reset to allow re-observation
  }, [avatarUrl]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current || !normalizedUrl) return;

    // Cleanup previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create Intersection Observer to detect when avatar enters viewport
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          // Once in view, we can unobserve
          if (observerRef.current && containerRef.current) {
            observerRef.current.unobserve(containerRef.current);
          }
        }
      },
      {
        root: null,
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01, // Trigger as soon as any part is visible
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current && containerRef.current) {
        observerRef.current.unobserve(containerRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [normalizedUrl]); // Re-observe when normalized URL changes

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // If no avatar URL or error occurred, show initials immediately
  if (!normalizedUrl || imageError) {
    return (
      <CustomAvatar skin='light' color={avatarColor} sx={customStyle}>
        {initials}
      </CustomAvatar>
    );
  }

  // Use native img tag with lazy loading and error handling
  // Show initials immediately, then fade in image when loaded
  // Only load image when it's in viewport (lazy loading)
  return (
    <Box 
      ref={containerRef}
      sx={{ position: 'relative', display: 'inline-block', ...customStyle }}
    >
      {/* Show initials as fallback (always visible behind image) */}
      <CustomAvatar
        skin='light'
        color={avatarColor}
        sx={{
          ...customStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      >
        {initials}
    </CustomAvatar>
      {/* Show image when loaded with fade-in effect - only load when in viewport */}
      {!imageError && isInView && (
        <CustomAvatar
          key={`${normalizedUrl}-${retryCount}`}
          src={normalizedUrl}
          sx={{
            ...customStyle,
            position: 'relative',
            zIndex: 1,
            opacity: imageLoaded ? 1 : 0,
            transition: imageLoaded ? 'opacity 0.15s ease-in' : 'none',
          }}
          alt={`${row?.firstName} ${row?.lastName}`}
          slotProps={{
            img: {
              ref: imgRef,
              onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const img = e.currentTarget;
                
                // Silently handle errors - don't let browser show error in console
                // Check if it's a 404 by examining the image element
                const is404 = img.naturalWidth === 0 && img.naturalHeight === 0;
                
                // For 404 (file doesn't exist), show initials immediately without retry
                // This is expected behavior, not an error - handle silently
                if (is404) {
                  setImageError(true);
                  setImageLoaded(false);
                  if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                    retryTimeoutRef.current = null;
                  }
                  // Remove src immediately to prevent browser from showing 404 in console
                  // Use empty data URL to prevent further requests
                  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                  img.srcset = '';
                  return;
                }
                
                // Don't retry if retries exhausted
                if (retryCount >= 3) {
                  setImageError(true);
                  if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                    retryTimeoutRef.current = null;
                  }
                  // Remove src to prevent browser from retrying
                  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                  img.srcset = '';
                  return;
                }
                
                // Retry with exponential backoff for network errors (not 404)
                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
                
                retryTimeoutRef.current = setTimeout(() => {
                  setRetryCount((prev) => prev + 1);
                  setImageError(false);
                  // The key prop change will force React to remount the component with new src
                }, delay);
              },
              onLoad: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const img = e.currentTarget;
                
                // Check if loaded image is placeholder (1x1 transparent GIF)
                // API returns placeholder for 404 or 429 (rate limited), so we need to detect it
                if (img.naturalWidth === 1 && img.naturalHeight === 1) {
                  // This is likely a placeholder (404 or rate-limited), show initials instead
                  // Don't retry for placeholders to prevent retry loops
                  setImageError(true);
                  setImageLoaded(false);
                  setRetryCount(999); // Set high to prevent any retries
                  if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                    retryTimeoutRef.current = null;
                  }
                  return;
                }
                
                setImageLoaded(true);
                setImageError(false);
                setRetryCount(0);
                if (retryTimeoutRef.current) {
                  clearTimeout(retryTimeoutRef.current);
                  retryTimeoutRef.current = null;
                }
              },
              loading: 'lazy',
              decoding: 'async',
            },
          }}
        />
      )}
    </Box>
  );
});

RenderAvatar.displayName = 'RenderAvatar';

export default RenderAvatar;
