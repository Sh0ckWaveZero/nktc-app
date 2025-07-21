'use client';

// ** Component Import
import RecordGoodnessIndividualPage from '@/views/apps/record-goodness/individual/RecordGoodnessIndividualPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function RecordGoodnessIndividual() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'record-goodness-page',
      }}
      guestGuard={false}
    >
      <RecordGoodnessIndividualPage />
    </AclGuard>
  );
}
