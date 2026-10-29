import type { Metadata } from 'next/types';

import AclGuard from '@/@core/components/auth/AclGuard';
import AcademicYearPage from '@/views/apps/settings/academic-year/academic-year-page';

export const metadata: Metadata = { title: 'ปีการศึกษา', description: 'จัดการปีการศึกษาและข้อมูลย้อนหลัง - NKTC' };

export default function Page() {
  return (
    <AclGuard aclAbilities={{ action: 'manage', subject: 'settings-academic-year-page' }} guestGuard={false}>
      <AcademicYearPage />
    </AclGuard>
  );
}
