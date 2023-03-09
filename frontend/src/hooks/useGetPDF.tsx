import httpClient from '@/@core/utils/http';
import { useState, useEffect } from 'react';

const useGetPDF = (url: string, token: string | null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [PDF, setPDF] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const existingPdfBytes = await httpClient.get(url, {
          responseType: 'arraybuffer',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPDF(existingPdfBytes.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      fetchPDF();
    } else {
      setIsLoading(false);
    }
  }, [url, token]);

  return { isLoading, PDF, error };
};

export default useGetPDF;
