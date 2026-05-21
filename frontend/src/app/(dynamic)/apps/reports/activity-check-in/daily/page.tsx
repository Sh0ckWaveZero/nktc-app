'use client';

// ** Component Import
import ActivityCheckInDailyReportPage from '@/views/apps/reports/activity-check-in/daily/ActivityCheckInDailyReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function ActivityCheckInDailyReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'report-check-in-daily-page',
      }}
      guestGuard={false}
    >
      <ActivityCheckInDailyReportPage />
    </AclGuard>
  );
}
