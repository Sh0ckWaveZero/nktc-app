'use client';

// ** Component Import
import HomePage from '@/views/pages/home/HomePage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function Home() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'home-page',
      }}
      guestGuard={false}
    >
      <HomePage />
    </AclGuard>
  );
}
