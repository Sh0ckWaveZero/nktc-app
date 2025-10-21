import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { queryKeys } from '@/libs/react-query/queryKeys';

// Fetch user by ID or username
export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiService.get(`/users/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refresh when window gets focus
    refetchOnMount: true, // Refresh when component mounts
  });
};

// Note: useCurrentUser is exported from useAuth.ts to keep auth-related hooks together

// Update user password
export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiService.put('/users/update/password', data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

// Update user password for admin
export const useUpdatePasswordForAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & any) =>
      apiService.put(`/users/update/password/${id}`, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};