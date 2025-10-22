import httpClient from '@/@core/utils/http';
import { useState, useEffect, useRef } from 'react';

interface UseGetImageReturn {
  isLoading: boolean;
  image: string | null;
  error: Error | null;
}

const DEFAULT_AVATAR = '/images/avatars/1.png';

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

        // Check if it's a data URL or default avatar (static files)
        if (url.startsWith('data:') || url === DEFAULT_AVATAR) {
          setImage(url);
          setIsLoading(false);
          return;
        }

        // Fetch the image from the server
        const response = await httpClient.get(url, {
          responseType: 'blob',
        });

        const newObjectUrl = URL.createObjectURL(response.data);
        objectUrlRef.current = newObjectUrl;
        setImage(newObjectUrl);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error loading image:', err);
        // Use default avatar on error
        setError(err);
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
