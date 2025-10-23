import { create } from 'zustand';

interface CacheEntry {
  url: string;
  objectUrl: string;
  timestamp: number;
  error?: Error | null;
}

interface ImageCacheStore {
  cache: Map<string, CacheEntry>;

  /**
   * Get cached image object URL
   * Returns null if not cached or expired
   */
  getImage: (url: string) => string | null;

  /**
   * Set cached image object URL
   * Automatically manages object URL lifecycle
   */
  setImage: (url: string, objectUrl: string) => void;

  /**
   * Set error for a URL (prevents retrying failed URLs immediately)
   */
  setError: (url: string, error: Error) => void;

  /**
   * Get cached error
   */
  getError: (url: string) => Error | null;

  /**
   * Clear specific cache entry and revoke object URL
   */
  clearImage: (url: string) => void;

  /**
   * Clear all cache and revoke all object URLs
   */
  clearAll: () => void;

  /**
   * Get cache size for debugging
   */
  getCacheSize: () => number;
}

const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache time

export const useImageCacheStore = create<ImageCacheStore>((set, get) => ({
  cache: new Map(),

  getImage: (url: string) => {
    const entry = get().cache.get(url);

    if (!entry) return null;

    // Check if cache expired
    const isExpired = Date.now() - entry.timestamp > CACHE_TTL;

    if (isExpired) {
      // Revoke expired URL and remove from cache
      get().clearImage(url);
      return null;
    }

    return entry.objectUrl;
  },

  setImage: (url: string, objectUrl: string) => {
    const state = get();
    const existingEntry = state.cache.get(url);

    // Revoke old object URL if exists
    if (existingEntry?.objectUrl) {
      try {
        URL.revokeObjectURL(existingEntry.objectUrl);
      } catch (err) {
        console.warn('Failed to revoke object URL:', err);
      }
    }

    // Create new cache entry
    const newCache = new Map(state.cache);
    newCache.set(url, {
      url,
      objectUrl,
      timestamp: Date.now(),
      error: null,
    });

    set({ cache: newCache });
  },

  setError: (url: string, error: Error) => {
    const state = get();
    const existingEntry = state.cache.get(url);

    // Create error entry (but don't store object URL)
    const newCache = new Map(state.cache);
    newCache.set(url, {
      url,
      objectUrl: '',
      timestamp: Date.now(),
      error,
    });

    set({ cache: newCache });
  },

  getError: (url: string) => {
    const entry = get().cache.get(url);

    if (!entry) return null;

    // Check if error cache expired (shorter TTL for errors: 5 minutes)
    const errorCacheTTL = 1000 * 60 * 5;
    const isExpired = Date.now() - entry.timestamp > errorCacheTTL;

    if (isExpired) {
      get().clearImage(url);
      return null;
    }

    return entry.error || null;
  },

  clearImage: (url: string) => {
    const state = get();
    const entry = state.cache.get(url);

    // Revoke object URL
    if (entry?.objectUrl) {
      try {
        URL.revokeObjectURL(entry.objectUrl);
      } catch (err) {
        console.warn('Failed to revoke object URL:', err);
      }
    }

    // Remove from cache
    const newCache = new Map(state.cache);
    newCache.delete(url);
    set({ cache: newCache });
  },

  clearAll: () => {
    const state = get();

    // Revoke all object URLs
    state.cache.forEach((entry) => {
      if (entry.objectUrl) {
        try {
          URL.revokeObjectURL(entry.objectUrl);
        } catch (err) {
          console.warn('Failed to revoke object URL:', err);
        }
      }
    });

    set({ cache: new Map() });
  },

  getCacheSize: () => {
    return get().cache.size;
  },
}));
