import httpClient from '@/@core/utils/http';
import { useQuery } from '@tanstack/react-query';

const useQueryImage = (url: string, token: string | null) => {
  const { isLoading, error, data } = useQuery(
    ['image', url, token],
    async () => {
      if (!url.startsWith('data:') && url !== '/images/avatars/1.png') {
        const response = await httpClient.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        });
        const newObjectUrl = URL.createObjectURL(response.data);
        return newObjectUrl;
      } else {
        return url;
      }
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0,
      onSuccess: (data) => {
        if (data) {
          URL.revokeObjectURL(data);
        }
      },
    },
  );

  return { isLoading, image: data, error };
};

export default useQueryImage;
