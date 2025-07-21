'use client';

// ** Component Import
import AdminCheckInMonthlyReportPage from '@/views/apps/admin/reports/check-in/monthly/AdminCheckInMonthlyReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function AdminCheckInMonthlyReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'admin-report-check-in-monthly-page',
      }}
      guestGuard={false}
    >
      <AdminCheckInMonthlyReportPage />
    </AclGuard>
  );
}
