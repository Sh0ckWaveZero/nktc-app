'use client';

// ** Component Import
import AdminCheckInWeeklyReportPage from '@/views/apps/admin/reports/check-in/weekly/AdminCheckInWeeklyReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function AdminCheckInWeeklyReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'admin-report-check-in-weekly-page',
      }}
      guestGuard={false}
    >
      <AdminCheckInWeeklyReportPage />
    </AclGuard>
  );
}
