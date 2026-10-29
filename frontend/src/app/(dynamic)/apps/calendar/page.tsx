import type { Metadata } from 'next/types';

import AclGuard from '@/@core/components/auth/AclGuard';
import AcademicCalendarPage from '@/views/apps/calendar/academic-calendar-page';

export const metadata: Metadata = {
  title: 'ปฏิทินการศึกษา',
  description: 'ปฏิทินการศึกษาและการตั้งค่าภาคเรียน - NKTC',
};

export default function Page() {
  return (
    <AclGuard aclAbilities={{ action: 'read', subject: 'calendar-page' }} guestGuard={false}>
      <AcademicCalendarPage />
    </AclGuard>
  );
}
