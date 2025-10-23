/**
 * Get Home URL based on User Roles
 */
export const getHomeRoute = (role: string): string => {
  if (role === 'Teacher') return '/home';
  if (role === 'Student') return '/apps/student/overview';
  return '/home';
};

/**
 * Check if route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  const publicRoutes = ['/login', '/register', '/forgot-password', '/404', '/500'];
  return !publicRoutes.some((route) => pathname.startsWith(route));
};

/**
 * Check if route is for guests only (redirect if authenticated)
 */
export const isGuestOnlyRoute = (pathname: string): boolean => {
  const guestRoutes = ['/login', '/register', '/forgot-password'];
  return guestRoutes.some((route) => pathname.startsWith(route));
};
