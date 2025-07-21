'use client';

// ** Component Import
import StudentOverviewPage from '@/views/apps/student/overview/StudentOverviewPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function StudentOverview() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-overview-page',
      }}
      guestGuard={false}
    >
      <StudentOverviewPage />
    </AclGuard>
  );
}
