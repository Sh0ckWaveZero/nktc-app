'use client';

// ** Component Import
import RecordGoodnessGroupPage from '@/views/apps/record-goodness/group/RecordGoodnessGroupPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function RecordGoodnessGroup() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'report-goodness-page',
      }}
      guestGuard={false}
    >
      <RecordGoodnessGroupPage />
    </AclGuard>
  );
}
