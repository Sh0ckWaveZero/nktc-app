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
        subject: 'daily-check-in-report-activity-page',
      }}
      guestGuard={false}
    >
      <ActivityCheckInDailyReportPage />
    </AclGuard>
  );
}
