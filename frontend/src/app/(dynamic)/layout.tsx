import { ReactNode } from 'react';

// Force dynamic rendering for all pages in this folder
export const dynamic = 'force-dynamic';

interface DynamicLayoutProps {
  children: ReactNode;
}

export default function DynamicLayout({ children }: DynamicLayoutProps) {
  return <>{children}</>;
}