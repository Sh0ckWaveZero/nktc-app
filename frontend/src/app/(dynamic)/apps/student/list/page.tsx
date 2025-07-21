'use client';

// ** Component Import
import StudentListPage from '@/views/apps/student/list/StudentListPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function StudentList() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-list-pages',
      }}
      guestGuard={false}
    >
      <StudentListPage />
    </AclGuard>
  );
}
