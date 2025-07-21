'use client';

// ** Component Import
import AdminActivityCheckInWeeklyReportPage from '@/views/apps/admin/reports/activity-check-in/weekly/AdminActivityCheckInWeeklyReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function AdminActivityCheckInWeeklyReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'admin-activity-check-in-page',
      }}
      guestGuard={false}
    >
      <AdminActivityCheckInWeeklyReportPage />
    </AclGuard>
  );
}
