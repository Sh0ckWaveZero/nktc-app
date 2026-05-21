'use client';

// ** Component Import
import CheckInDailyReportPage from '@/views/apps/reports/check-in/daily/CheckInDailyReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function CheckInDailyReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'daily-check-in-report-activity-page',
      }}
      guestGuard={false}
    >
      <CheckInDailyReportPage />
    </AclGuard>
  );
}
