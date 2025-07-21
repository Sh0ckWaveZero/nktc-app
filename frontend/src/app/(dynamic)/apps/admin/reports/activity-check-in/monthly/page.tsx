'use client';

// ** Component Import
import AdminActivityCheckInMonthlyReportPage from '@/views/apps/admin/reports/activity-check-in/monthly/AdminActivityCheckInMonthlyReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function AdminActivityCheckInMonthlyReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'admin-activity-check-in-page',
      }}
      guestGuard={false}
    >
      <AdminActivityCheckInMonthlyReportPage />
    </AclGuard>
  );
}
