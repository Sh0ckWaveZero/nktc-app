import { useQuery } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';

/**
 * Hook to fetch PDF file using React Query
 * Provides better caching, error handling, and integration with React Query
 */
const useGetPDF = (url: string) => {
  const { data: PDF = null, isLoading, error } = useQuery({
    queryKey: ['pdf', url],
    queryFn: async () => {
      if (!url) return null;
      const response = await httpClient.get(url, {
        responseType: 'arraybuffer'
      });
      return response.data;
    },
    enabled: !!url,
    staleTime: 30 * 60 * 1000, // 30 minutes - PDFs don't change often
  });

  return { isLoading, PDF, error };
};

export default useGetPDF;
