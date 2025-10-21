'use client';

export const dynamic = 'force-dynamic';

// ** Component Import
import UserViewPage from '@/views/apps/user/view/UserViewPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

interface UserViewPageWrapperProps {
  id: string;
}

export default function UserViewPageWrapper({ id }: UserViewPageWrapperProps) {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'view-user-page',
      }}
      guestGuard={false}
    >
      <UserViewPage id={id} />
    </AclGuard>
  );
}