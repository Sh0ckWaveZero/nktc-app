'use client';

// ** Component Import
import ProgramSettingsPage from '@/views/apps/settings/program/ProgramSettingsPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function ProgramSettings() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'manage',
        subject: 'settings-program-list-pages',
      }}
      guestGuard={false}
    >
      <ProgramSettingsPage />
    </AclGuard>
  );
}
