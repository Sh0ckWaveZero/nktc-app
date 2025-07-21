'use client';

// ** Component Import
import AdminCheckInDailyReportPage from '@/views/apps/admin/reports/check-in/daily/AdminCheckInDailyReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function AdminCheckInDailyReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'admin-report-check-in-daily-page',
      }}
      guestGuard={false}
    >
      <AdminCheckInDailyReportPage />
    </AclGuard>
  );
}
