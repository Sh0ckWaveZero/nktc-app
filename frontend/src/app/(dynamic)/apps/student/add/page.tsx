'use client';

// ** Component Import
import StudentAddPage from '@/views/apps/student/add/StudentAddPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function StudentAdd() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'create',
        subject: 'add-student-page',
      }}
      guestGuard={false}
    >
      <StudentAddPage />
    </AclGuard>
  );
}
