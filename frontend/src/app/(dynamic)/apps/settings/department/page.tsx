'use client';

import AclGuard from '@/@core/components/auth/AclGuard';
import DepartmentSettingsPage from '@/views/apps/settings/department/DepartmentSettingsPage';

export default function DepartmentSettings() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'manage',
        subject: 'settings-department-list-pages',
      }}
      guestGuard={false}
    >
      <DepartmentSettingsPage />
    </AclGuard>
  );
}
