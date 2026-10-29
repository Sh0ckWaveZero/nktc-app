'use client';

// ** Component Import
import SecurityTrustCenterPage from '@/views/pages/security/SecurityTrustCenterPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function SecurityPage() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'security-page',
      }}
      guestGuard={false}
    >
      <SecurityTrustCenterPage />
    </AclGuard>
  );
}
