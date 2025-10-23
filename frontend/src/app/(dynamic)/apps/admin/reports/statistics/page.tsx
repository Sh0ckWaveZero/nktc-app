import type { Metadata } from 'next/types';
import TermStatisticsPage from '@/views/apps/admin/reports/statistics/TermStatisticsPage';
import AclGuard from '@/@core/components/auth/AclGuard';

export const metadata: Metadata = {
  title: 'สถิติการใช้งานระบบตามเทอม',
  description: 'สถิติการใช้งานระบบตามเทอม - NKTC',
};

export default function Page() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'admin-statistics-page',
      }}
      guestGuard={false}
    >
      <TermStatisticsPage />
    </AclGuard>
  );
}
