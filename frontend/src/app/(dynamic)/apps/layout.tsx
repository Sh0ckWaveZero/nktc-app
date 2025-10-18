export const dynamic = 'force-dynamic';

interface AppsLayoutProps {
  children: React.ReactNode;
}

export default function AppsLayout({ children }: AppsLayoutProps) {
  return <>{children}</>;
}
