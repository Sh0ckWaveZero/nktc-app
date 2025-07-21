'use client';

// ** Component Import
import AdminActivityCheckInDailyReportPage from '@/views/apps/admin/reports/activity-check-in/daily/AdminActivityCheckInDailyReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function AdminActivityCheckInDailyReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'admin-activity-check-in-page',
      }}
      guestGuard={false}
    >
      <AdminActivityCheckInDailyReportPage />
    </AclGuard>
  );
}
