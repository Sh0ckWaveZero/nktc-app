'use client';

// ** Component Import
import BadnessAllReportPage from '@/views/apps/reports/badness/all/BadnessAllReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function BadnessAllReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'report-badness-page',
      }}
      guestGuard={false}
    >
      <BadnessAllReportPage />
    </AclGuard>
  );
}
