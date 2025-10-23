// ** Layout Import
import UserLayout from '@/layouts/UserLayout';

// Force dynamic rendering for all pages in this folder
export const dynamic = 'force-dynamic';

interface DynamicLayoutProps {
  children: React.ReactNode;
}

export default function DynamicLayout({ children }: DynamicLayoutProps) {
  return <UserLayout>{children}</UserLayout>;
}
