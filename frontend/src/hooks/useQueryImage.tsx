import httpClient from '@/@core/utils/http';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/libs/react-query/queryKeys';

/**
 * Hook to fetch and cache images using React Query
 * @param url - Image URL to fetch
 * @param token - Authentication token (optional)
 */
const useQueryImage = (url: string, token: string | null) => {
  const { isLoading, error, data } = useQuery({
    queryKey: queryKeys.images.image(url, token),
    queryFn: async () => {
      if (!url.startsWith('data:') && url !== '/images/avatars/1.png') {
        const response = await httpClient.get(url, {
          responseType: 'blob',
        });
        const newObjectUrl = URL.createObjectURL(response.data);
        return newObjectUrl;
      } else {
        return url;
      }
    },
    enabled: !!url, // Only fetch when URL exists
    refetchOnWindowFocus: false,
    retry: false,
    gcTime: 0, // Don't cache (formerly cacheTime)
    staleTime: 0, // Always refetch
  });

  return { isLoading, image: data, error };
};

export default useQueryImage;
