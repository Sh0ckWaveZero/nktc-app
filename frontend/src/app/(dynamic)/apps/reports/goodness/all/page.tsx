'use client';

// ** Component Import
import GoodnessAllReportPage from '@/views/apps/reports/goodness/all/GoodnessAllReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function GoodnessAllReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'report-goodness-page',
      }}
      guestGuard={false}
    >
      <GoodnessAllReportPage />
    </AclGuard>
  );
}
