import { useState, useEffect } from 'react';
import httpClient from '@/@core/utils/http';
import { useImageCacheStore } from '@/store/image-cache';

interface UseImageQueryReturn {
  isLoading: boolean;
  image: string | null;
  error: Error | null;
}

const DEFAULT_AVATAR = '/images/avatars/1.png';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Validates that the URL is safe to load
 * Only allows relative URLs (from our API), URLs from our own server, data URLs (from user uploads), or the default avatar
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Allow relative URLs (starting with /)
  if (url.startsWith('/')) return true;

  // Allow URLs from our own API server
  if (API_URL && url.startsWith(API_URL)) return true;

  // Allow URLs from the same base server (for static assets)
  // Handle both /api and /statics paths
  if (API_URL) {
    const baseUrl = API_URL.replace('/api', '');
    if (url.startsWith(baseUrl)) return true;
    
    // Also check if URL contains our domain (for statics paths)
    try {
      const apiUrlObj = new URL(API_URL);
      const urlObj = new URL(url);
      if (apiUrlObj.hostname === urlObj.hostname) return true;
    } catch {
      // If URL parsing fails, continue with other checks
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

        // Convert absolute URL to relative if it's from our server
        let imageUrl = url;
        if (API_URL && url.startsWith(API_URL)) {
          // Convert absolute API URL to relative path
          imageUrl = url.replace(API_URL, '');
        } else if (API_URL) {
          try {
            const apiUrlObj = new URL(API_URL);
            const urlObj = new URL(url);
            if (apiUrlObj.hostname === urlObj.hostname) {
              // Same domain, use relative path
              imageUrl = urlObj.pathname + urlObj.search;
            }
          } catch {
            // Keep original URL if parsing fails
          }
        }

        // Fetch the image from the server with timeout
         
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout (reduced from 10s)

        try {
          const response = await httpClient.get<Blob>(imageUrl, {
            responseType: 'blob',
            signal: controller.signal,
            timeout: 5000, // Additional timeout protection
          });

          clearTimeout(timeoutId);

          // Validate content type
          const contentType = response.headers['content-type'] || response.data.type;
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
          if (response.data.size > MAX_IMAGE_SIZE) {
            console.warn(`Image too large: ${response.data.size} bytes`);
            const err = new Error('Image file too large');
            cacheError(url, err);
            setError(err);
            setImage(DEFAULT_AVATAR);
            setIsLoading(false);
            return;
          }

          // Create object URL and cache it
          const objectUrl = URL.createObjectURL(response.data);
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
