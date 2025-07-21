export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';

interface AppsLayoutProps {
  children: ReactNode;
}

export default function AppsLayout({ children }: AppsLayoutProps) {
  return <>{children}</>;
}