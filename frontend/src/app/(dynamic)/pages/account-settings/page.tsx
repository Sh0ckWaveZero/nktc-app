'use client';

// ** Component Import
import AccountSettingsPage from '@/views/pages/account-settings/AccountSettingsPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function AccountSettings() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'account-page',
      }}
      guestGuard={false}
    >
      <AccountSettingsPage />
    </AclGuard>
  );
}
