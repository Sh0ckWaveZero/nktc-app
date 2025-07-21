'use client';

// ** Component Import
import ClassroomSettingsPage from '@/views/apps/settings/classroom/ClassroomSettingsPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function ClassroomSettings() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'manage',
        subject: 'settings-classroom-list-pages',
      }}
      guestGuard={false}
    >
      <ClassroomSettingsPage />
    </AclGuard>
  );
}
