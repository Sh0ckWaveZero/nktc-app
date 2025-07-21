'use client';

// ** Component Import
import GoodnessIndividualReportPage from '@/views/apps/reports/goodness/individual/GoodnessIndividualReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function GoodnessIndividualReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-goodness-report',
      }}
      guestGuard={false}
    >
      <GoodnessIndividualReportPage />
    </AclGuard>
  );
}
