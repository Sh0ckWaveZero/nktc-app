import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  // During static generation or when context is not available, return null-safe values
  if (!context) {
    return {
      user: null,
      loading: false,
      setUser: () => null,
      setLoading: () => Boolean,
      isInitialized: false,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      setIsInitialized: () => Boolean,
      register: () => Promise.resolve(),
    };
  }

  return context;
};
