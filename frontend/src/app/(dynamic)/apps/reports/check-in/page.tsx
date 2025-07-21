'use client';

// ** Component Import
import CheckInReportPage from '@/views/apps/reports/check-in/CheckInReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function CheckInReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'check-in-page',
      }}
      guestGuard={false}
    >
      <CheckInReportPage />
    </AclGuard>
  );
}
