'use client';

// ** Component Import
import GoodnessSummaryReportPage from '@/views/apps/reports/goodness/summary/GoodnessSummaryReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function GoodnessSummaryReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-goodness-summary-report',
      }}
      guestGuard={false}
    >
      <GoodnessSummaryReportPage />
    </AclGuard>
  );
}
