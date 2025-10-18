'use client';

export const dynamic = 'force-dynamic';

// ** Component Import
import StudentViewPage from '@/views/apps/student/view/StudentViewPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

interface StudentViewPageWrapperProps {
  id: string;
}

export default function StudentViewPageWrapper({ id }: StudentViewPageWrapperProps) {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'view-student-page',
      }}
      guestGuard={false}
    >
      <StudentViewPage id={id} />
    </AclGuard>
  );
}
