import { useState, useEffect } from 'react';
import { apiConfig } from '@/configs/api';
import { useImageCacheStore } from '@/store/image-cache';

interface UseImageQueryReturn {
  isLoading: boolean;
  image: string | null;
  error: Error | null;
}

const DEFAULT_AVATAR = '/images/avatars/1.png';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const normalizeImageUrl = (url: string): string => {
  if (!url || url === DEFAULT_AVATAR || url.startsWith('data:image/')) {
    return url;
  }

  if (url.startsWith('/api/')) {
    return url;
  }

  if (url.startsWith('/statics/')) {
    return apiConfig.browserUrl(url);
  }

  if (url.startsWith('/')) {
    return url;
  }

  return apiConfig.browserUrl(url);
};

/**
 * Validates that the URL is safe to load
 * Only allows relative URLs (from our API), URLs from our own server, data URLs (from user uploads), or the default avatar
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Allow relative URLs (starting with /)
  if (url.startsWith('/')) return true;

  // Allow URLs from our own API server
  if (apiConfig.legacyApiUrl && url.startsWith(apiConfig.legacyApiUrl)) return true;

  if (apiConfig.appUrl) {
    try {
      const appUrl = new URL(apiConfig.appUrl);
      const imageUrl = new URL(url);

      if (appUrl.origin === imageUrl.origin) {
        return true;
      }
    } catch {
      // Ignore invalid absolute URLs and continue with other checks
    }
  }

  if (url === DEFAULT_AVATAR) return true;

  // Allow data URLs (safe for user-uploaded images)
  if (url.startsWith('data:image/')) return true;

  // Block everything else (external URLs, javascript: URLs, etc)
  return false;
};

/**
 * Zustand-based image loading hook with caching
 * - Persistent cache with 1-hour TTL for successful loads
 * - Error tracking with 5-minute TTL (prevents spam retries)
 * - Image validation (type, size)
 * - Security URL validation
 * - Graceful fallback to default avatar on error
 *
 * @param url - Image URL to fetch
 * @returns Object with loading state, image blob URL, and error info
 */
const useImageQuery = (url: string): UseImageQueryReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [image, setImage] = useState<string | null>(null);

  // Zustand store for caching
  const { getImage, setImage: cacheImage, setError: cacheError, getError } = useImageCacheStore();

  useEffect(() => {
    const fetchImage = async () => {
      setError(null);
      setIsLoading(true);

      try {
        // No URL provided, use default
        if (!url) {
          setImage(DEFAULT_AVATAR);
          setIsLoading(false);
          return;
        }

        // Validate URL for security
        if (!isValidImageUrl(url)) {
          console.warn(`Invalid image URL blocked: ${url}`);
          const err = new Error('Invalid image URL');
          setError(err);
          setImage(DEFAULT_AVATAR);
          setIsLoading(false);
          return;
        }

        // Use default avatar directly (no fetch needed)
        if (url === DEFAULT_AVATAR) {
          setImage(DEFAULT_AVATAR);
          setIsLoading(false);
          return;
        }

        // Handle data URLs directly (no fetch needed)
        if (url.startsWith('data:image/')) {
          setImage(url);
          setIsLoading(false);
          return;
        }

        // Check if image is already cached
        const cachedImage = getImage(url);
        if (cachedImage) {
          setImage(cachedImage);
          setIsLoading(false);
          return;
        }

        // Check if there's a recent error (prevent spam retries)
        const cachedError = getError(url);
        if (cachedError) {
          setError(cachedError);
          setImage(DEFAULT_AVATAR);
          setIsLoading(false);
          return;
        }

        const imageUrl = normalizeImageUrl(url);

        // Fetch the image from the server with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout (reduced from 10s)

        try {
          const token = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
          const response = await fetch(imageUrl, {
            headers: {
              Accept: 'image/webp,image/avif,image/png,image/jpeg,image/gif,*/*',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }

          const imageBlob = await response.blob();

          // Validate content type
          const contentType = response.headers.get('content-type') || imageBlob.type;
          if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
            console.warn(`Invalid content type: ${contentType}`);
            const err = new Error('Invalid image format');
            cacheError(url, err);
            setError(err);
            setImage(DEFAULT_AVATAR);
            setIsLoading(false);
            return;
          }

          // Validate file size
          if (imageBlob.size > MAX_IMAGE_SIZE) {
            console.warn(`Image too large: ${imageBlob.size} bytes`);
            const err = new Error('Image file too large');
            cacheError(url, err);
            setError(err);
            setImage(DEFAULT_AVATAR);
            setIsLoading(false);
            return;
          }

          // Create object URL and cache it
          const objectUrl = URL.createObjectURL(imageBlob);
          cacheImage(url, objectUrl);
          setImage(objectUrl);
          setIsLoading(false);
        } catch (err: any) {
          clearTimeout(timeoutId);

          // Handle abort timeout
          const error = err?.name === 'AbortError' ? new Error('Image loading timeout') : err;

          cacheError(url, error);
          setError(error);
          setImage(DEFAULT_AVATAR);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading image:', err);
        setError(err);
        setImage(DEFAULT_AVATAR);
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [url, getImage, getError, cacheImage, cacheError]);

  return {
    isLoading,
    image: image ?? DEFAULT_AVATAR,
    error,
  };
};

export default useImageQuery;
