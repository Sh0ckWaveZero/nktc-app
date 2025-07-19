export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';

// ** Layout Import
import UserLayout from '@/layouts/UserLayout';

interface AppsLayoutProps {
  children: ReactNode;
}

export default function AppsLayout({ children }: AppsLayoutProps) {
  return <UserLayout>{children}</UserLayout>;
}