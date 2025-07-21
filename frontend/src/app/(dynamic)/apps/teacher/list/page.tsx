'use client';

// ** Component Import
import TeacherListPage from '@/views/apps/teacher/list/TeacherListPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function TeacherList() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'teacher-list-pages',
      }}
      guestGuard={false}
    >
      <TeacherListPage />
    </AclGuard>
  );
}
