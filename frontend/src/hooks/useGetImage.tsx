import httpClient from '@/@core/utils/http';
import { useState, useEffect, useRef } from 'react';

interface UseGetImageReturn {
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
 * Only allows relative URLs (from our API) or the default avatar
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Only allow relative URLs (starting with /) or URLs from our own API
  if (url.startsWith('/')) return true;
  if (url.startsWith(API_URL)) return true;
  if (url === DEFAULT_AVATAR) return true;

  // Block everything else (external URLs, data: URLs, javascript: URLs, etc)
  return false;
};

const useGetImage = (url: string): UseGetImageReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      setError(null);
      setIsLoading(true);

      try {
        if (!url) {
          // No URL provided, use default
          setImage(DEFAULT_AVATAR);
          setIsLoading(false);
          return;
        }

        // Validate URL for security (prevent SSRF, XSS, etc)
        if (!isValidImageUrl(url)) {
          console.warn(`Invalid image URL blocked: ${url}`);
          setError(new Error('Invalid image URL'));
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

        // Fetch the image from the server with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await httpClient.get(url, {
          responseType: 'blob',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Validate content type
        const contentType = response.headers['content-type'] || response.data.type;
        if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
          console.warn(`Invalid content type: ${contentType}`);
          setError(new Error('Invalid image format'));
          setImage(DEFAULT_AVATAR);
          setIsLoading(false);
          return;
        }

        // Validate file size
        if (response.data.size > MAX_IMAGE_SIZE) {
          console.warn(`Image too large: ${response.data.size} bytes`);
          setError(new Error('Image file too large'));
          setImage(DEFAULT_AVATAR);
          setIsLoading(false);
          return;
        }

        // Create object URL
        const newObjectUrl = URL.createObjectURL(response.data);
        objectUrlRef.current = newObjectUrl;
        setImage(newObjectUrl);
        setIsLoading(false);
      } catch (err: any) {
        // Handle abort timeout
        if (err?.name === 'AbortError') {
          console.error('Image loading timeout');
          setError(new Error('Image loading timeout'));
        } else {
          console.error('Error loading image:', err);
          setError(err);
        }
        // Use default avatar on error
        setImage(DEFAULT_AVATAR);
        setIsLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [url]);

  return { isLoading, image, error };
};

export default useGetImage;
