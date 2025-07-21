'use client';

// ** Component Import
import VisitAddPage from '@/views/apps/visit/add/VisitAddPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function VisitAdd() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'create',
        subject: 'create-visit-student-page',
      }}
      guestGuard={false}
    >
      <VisitAddPage />
    </AclGuard>
  );
}
