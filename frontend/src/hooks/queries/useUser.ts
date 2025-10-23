import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/react-query/queryKeys';
import httpClient from '@/@core/utils/http';
import { authConfig } from '@/configs/auth';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  AuditLogParams,
  AuditLogsResponse,
  UserDataType,
} from '@/types/apps/userTypes';

/**
 * Hook to fetch user by ID
 * @param userId - User ID to fetch
 * @param enabled - Whether to enable auto-fetching
 */
export const useUserById = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
      return data as UserDataType;
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch audit logs for a user
 * Server-side paginated with skip/take
 */
export const useAuditLogs = (params: AuditLogParams) => {
  return useQuery({
    queryKey: queryKeys.users.auditLogs(params.userName, params.skip, params.take),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.userEndpoint}/audit-logs/${params.userName}?skip=${params.skip || 0}&take=${params.take || 10}`,
      );
      return data as AuditLogsResponse;
    },
    enabled: !!params.userName,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to change user password
 * Requires re-authentication after success
 *
 * @example
 * ```tsx
 * const { mutate: changePassword, isPending } = useChangePassword();
 *
 * const handleSubmit = (data) => {
 *   changePassword({
 *     old_password: data.currentPassword,
 *     new_password: data.newPassword
 *   }, {
 *     onSuccess: () => {
 *       toast.success('Password changed successfully');
 *       // Re-login with new password
 *     },
 *     onError: (error) => {
 *       toast.error(error.message);
 *     }
 *   });
 * };
 * ```
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await httpClient.put(`${authConfig.changePasswordEndpoint}`, data);
      return response.data as ChangePasswordResponse;
    },
    onSuccess: () => {
      // Invalidate current user query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
    },
  });
};

/**
 * Hook to update user profile
 * Automatically invalidates related queries
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: any) => {
      const { data } = await httpClient.put(`${process.env.NEXT_PUBLIC_API_URL}/users/${profileData.id}`, profileData);
      return data;
    },
    onSuccess: (data, variables) => {
      // Update current user in cache
      queryClient.setQueryData(queryKeys.users.current(), data);

      // Invalidate user detail query
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });

      // Invalidate all users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Hook to reset password by admin
 * Admin-only operation
 */
export const useResetPasswordByAdmin = () => {
  return useMutation({
    mutationFn: async (data: { teacher: { id: string }; newPassword: string }) => {
      const response = await httpClient.put(`${authConfig.userEndpoint}/update/password/${data.teacher.id}`, data);
      return response.data;
    },
  });
};

/**
 * Hook to create new user
 * Admin operation
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await httpClient.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, userData);
      return data;
    },
    onSuccess: () => {
      // Invalidate users list to show new user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Hook to delete user
 * Admin operation
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await httpClient.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
      return data;
    },
    onSuccess: () => {
      // Invalidate users list to remove deleted user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};
