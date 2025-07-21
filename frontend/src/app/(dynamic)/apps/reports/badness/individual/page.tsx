'use client';

// ** Component Import
import BadnessIndividualReportPage from '@/views/apps/reports/badness/individual/BadnessIndividualReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function BadnessIndividualReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-badness-report',
      }}
      guestGuard={false}
    >
      <BadnessIndividualReportPage />
    </AclGuard>
  );
}
