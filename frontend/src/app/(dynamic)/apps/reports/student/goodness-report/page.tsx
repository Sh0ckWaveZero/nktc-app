'use client';

// ** Component Import
import StudentGoodnessReportPage from '@/views/apps/reports/student/goodness-report/StudentGoodnessReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function StudentGoodnessReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-goodness-report',
      }}
      guestGuard={false}
    >
      <StudentGoodnessReportPage />
    </AclGuard>
  );
}
