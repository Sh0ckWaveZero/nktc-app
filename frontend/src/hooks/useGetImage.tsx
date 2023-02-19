import httpClient from '@/@core/utils/http';
import { useState, useEffect } from 'react';

const useGetImage = (url: string, token: string | null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const image = url.match('data:image/(.*);base64,(.*)');
        if (!image && url !== '/images/avatars/1.png') {
          const response = await httpClient.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
          });
          setImage(URL.createObjectURL(response.data) as any);
        } else {
          setImage(url as any);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      fetchImage();
    }

    return () => {
      URL.revokeObjectURL(image);
    };
  }, [url, token]);

  return { isLoading, error, image };
};

export default useGetImage;
