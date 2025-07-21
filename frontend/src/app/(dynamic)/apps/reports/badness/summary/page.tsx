'use client';

// ** Component Import
import BadnessSummaryReportPage from '@/views/apps/reports/badness/summary/BadnessSummaryReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function BadnessSummaryReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-badness-summary-report',
      }}
      guestGuard={false}
    >
      <BadnessSummaryReportPage />
    </AclGuard>
  );
}
