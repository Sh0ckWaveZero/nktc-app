import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface LoginParams {
  username: string;
  password: string;
}

interface RegisterParams {
  username: string;
  password: string;
  email: string;
}

/**
 * Hook to get current user info
 * Auto-fetches on mount if token exists
 */
export const useCurrentUser = () => {
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: async () => {
      const { data } = await httpClient.get(authConfig.meEndpoint as string);
      return data;
    },
    enabled: !!storedToken, // Only fetch if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401
  });
};

/**
 * Hook to handle login
 * Use with AuthContext for full authentication flow
 *
 * @example
 * ```tsx
 * const { mutate: login, isPending } = useLogin();
 *
 * const handleSubmit = (data) => {
 *   login(data, {
 *     onSuccess: (response) => {
 *       // AuthContext will handle token & redirect
 *       console.log('Logged in:', response);
 *     },
 *     onError: (error) => {
 *       toast.error('Invalid credentials');
 *     },
 *   });
 * };
 * ```
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: LoginParams) => {
      const { data } = await httpClient.post(authConfig.loginEndpoint as string, params);
      return data;
    },
    onSuccess: (data) => {
      // Save token and user data to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('accessToken', data.token);
        window.localStorage.setItem('userData', JSON.stringify(data));
      }

      // Set user in cache
      queryClient.setQueryData(queryKeys.users.current(), data.data);

      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: () => {
      // Clear any cached data on error
      queryClient.clear();
    },
  });
};

/**
 * Hook to handle logout
 * Clears all cached data and redirects to login
 *
 * @example
 * ```tsx
 * const { mutate: logout } = useLogout();
 *
 * const handleLogout = () => {
 *   logout();
 * };
 * ```
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Call logout endpoint if exists
      const logoutEndpoint = (authConfig as any).logoutEndpoint;
      if (logoutEndpoint) {
        await httpClient.post(logoutEndpoint);
      }
    },
    onSuccess: () => {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('userData');
        window.localStorage.removeItem('refreshToken');
      }

      // Clear all React Query cache
      queryClient.clear();
    },
  });
};

/**
 * Hook to handle registration
 * Automatically logs in after successful registration
 *
 * @example
 * ```tsx
 * const { mutate: register, isPending } = useRegister();
 *
 * const handleSubmit = (data) => {
 *   register(data, {
 *     onSuccess: () => {
 *       toast.success('Registration successful!');
 *     },
 *     onError: (error) => {
 *       toast.error('Registration failed');
 *     },
 *   });
 * };
 * ```
 */
export const useRegister = () => {
  const { mutate: login } = useLogin();

  return useMutation({
    mutationFn: async (params: RegisterParams) => {
      const { data } = await httpClient.post(authConfig.registerEndpoint as string, params);
      return data;
    },
    onSuccess: (data, variables) => {
      // Auto-login after successful registration
      login({
        username: variables.username,
        password: variables.password,
      });
    },
  });
};
