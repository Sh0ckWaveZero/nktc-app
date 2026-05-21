import type { Metadata } from 'next/types';
import AclGuard from '@/@core/components/auth/AclGuard';
import AdminVisitReportPage from '@/views/apps/admin/reports/visit/AdminVisitReportPage';

export const metadata: Metadata = {
  title: 'รายงานการเยี่ยมบ้าน',
  description: 'รายงานการเยี่ยมบ้าน - NKTC',
};

export default function Page() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'admin-visit-report-page',
      }}
      guestGuard={false}
    >
      <AdminVisitReportPage />
    </AclGuard>
  );
}