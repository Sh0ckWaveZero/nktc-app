'use client';

// ** Component Import
import CheckInSummaryReportPage from '@/views/apps/reports/check-in/summary/CheckInSummaryReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function CheckInSummaryReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'report-check-in-summary-page',
      }}
      guestGuard={false}
    >
      <CheckInSummaryReportPage />
    </AclGuard>
  );
}
