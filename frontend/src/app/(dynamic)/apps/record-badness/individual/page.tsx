'use client';

// ** Component Import
import RecordBadnessIndividualPage from '@/views/apps/record-badness/individual/RecordBadnessIndividualPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function RecordBadnessIndividual() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'record-badness-page',
      }}
      guestGuard={false}
    >
      <RecordBadnessIndividualPage />
    </AclGuard>
  );
}
