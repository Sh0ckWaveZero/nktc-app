'use client';

// ** Component Import
import ActivityCheckInReportPage from '@/views/apps/reports/activity-check-in/ActivityCheckInReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function ActivityCheckInReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'activity-check-in-page',
      }}
      guestGuard={false}
    >
      <ActivityCheckInReportPage />
    </AclGuard>
  );
}
