'use client';

// ** Component Import
import VisitListPage from '@/views/apps/visit/list/VisitListPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function VisitList() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'visit-student-list-page',
      }}
      guestGuard={false}
    >
      <VisitListPage />
    </AclGuard>
  );
}
