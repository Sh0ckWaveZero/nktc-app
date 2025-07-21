import { ReactNode } from 'react';

// Force dynamic rendering for auth pages
export const dynamic = 'force-dynamic';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // No UserLayout wrapper for authentication pages
  return <>{children}</>;
}