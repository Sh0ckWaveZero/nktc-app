'use client';

// ** Component Import
import RecordBadnessGroupPage from '@/views/apps/record-badness/group/RecordBadnessGroupPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function RecordBadnessGroup() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'report-badness-group-page',
      }}
      guestGuard={false}
    >
      <RecordBadnessGroupPage />
    </AclGuard>
  );
}
