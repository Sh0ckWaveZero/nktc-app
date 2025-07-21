'use client';

// ** Component Import
import ActivityCheckInSummaryReportPage from '@/views/apps/reports/activity-check-in/summary/ActivityCheckInSummaryReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function ActivityCheckInSummaryReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'summary-check-in-report-activity-page',
      }}
      guestGuard={false}
    >
      <ActivityCheckInSummaryReportPage />
    </AclGuard>
  );
}
