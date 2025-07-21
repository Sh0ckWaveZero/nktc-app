'use client';

// ** Component Import
import ACLPage from '@/views/pages/acl/ACLPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function ACL() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'acl-page',
      }}
      guestGuard={false}
    >
      <ACLPage />
    </AclGuard>
  );
}
