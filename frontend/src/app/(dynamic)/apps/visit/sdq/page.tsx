'use client';

// ** Component Import
import SdqAssessmentPage from '@/views/apps/visit/sdq/SdqAssessmentPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function SdqAssessmentRoute() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'visit-student-list-page',
      }}
      guestGuard={false}
    >
      <SdqAssessmentPage />
    </AclGuard>
  );
}
