
// Force dynamic rendering for auth pages
export const dynamic = 'force-dynamic';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // No UserLayout wrapper for authentication pages
  return <>{children}</>;
}
