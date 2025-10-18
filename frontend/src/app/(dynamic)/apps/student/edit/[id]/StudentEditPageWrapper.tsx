'use client';

export const dynamic = 'force-dynamic';

// ** Component Import
import StudentEditPage from '@/views/apps/student/edit/StudentEditPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

interface StudentEditPageWrapperProps {
  id: string;
}

export default function StudentEditPageWrapper({ id }: StudentEditPageWrapperProps) {
  return (
    <AclGuard
      aclAbilities={{
        action: 'update',
        subject: 'student-edit-page',
      }}
      guestGuard={false}
    >
      <StudentEditPage id={id} />
    </AclGuard>
  );
}
