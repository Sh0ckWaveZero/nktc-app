import { ThemeColor } from '@/@core/layouts/types';

/**
 * Get avatar color from theme based on ID/name and day of week
 * Combines user identifier with current day to create variety
 * while ensuring colors change daily for visual interest
 * 
 * Available colors: primary, secondary, success, warning, info, other
 * (Excludes 'error' as it's too harsh for avatars)
 */
export const getAvatarColor = (id?: string | number | null, name?: string): ThemeColor => {
  // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = new Date().getDay();
  
  // Use ID if available, otherwise use name
  const identifier = id?.toString() || name || '';
  
  // Available colors (excluding 'error' as it's too harsh)
  const colors: ThemeColor[] = ['primary', 'secondary', 'success', 'warning', 'info', 'other'];
  
  if (!identifier) {
    // If no identifier, use day of week directly
    return colors[dayOfWeek % colors.length];
  }

  // Create a hash from the identifier for consistency
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Combine hash with day of week to create variety that changes daily
  // This ensures each person has a different color, but colors shift daily
  const combinedHash = Math.abs(hash) + dayOfWeek;
  const colorIndex = combinedHash % colors.length;
  
  return colors[colorIndex];
};

