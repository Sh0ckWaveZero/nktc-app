import httpClient from '@/@core/utils/http';
import { useState, useEffect } from 'react';

const useGetImage = (url: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (!url.startsWith('data:') && url !== '/images/avatars/1.png') {
          const response = await httpClient.get(url, {
            responseType: 'blob',
          });
          const newObjectUrl = URL.createObjectURL(response.data);
          setObjectUrl(newObjectUrl);
          setImage(newObjectUrl);
        } else {
          setImage(url);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      fetchImage();
    } else {
      setImage('');
      setIsLoading(false);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return { isLoading, image, error };
};

export default useGetImage;
