'use client';

// ** Component Import
import StudentBadnessReportPage from '@/views/apps/reports/student/badness-report/StudentBadnessReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function StudentBadnessReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-badness-report',
      }}
      guestGuard={false}
    >
      <StudentBadnessReportPage />
    </AclGuard>
  );
}
