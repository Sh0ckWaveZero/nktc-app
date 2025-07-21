import { ReactNode } from 'react';

// Force dynamic rendering for error pages
export const dynamic = 'force-dynamic';

interface ErrorLayoutProps {
  children: ReactNode;
}

export default function ErrorLayout({ children }: ErrorLayoutProps) {
  return <>{children}</>;
}