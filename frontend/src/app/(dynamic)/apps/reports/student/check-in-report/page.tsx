'use client';

// ** Component Import
import StudentCheckInReportPage from '@/views/apps/reports/student/check-in-report/StudentCheckInReportPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function StudentCheckInReport() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'student-check-in-report',
      }}
      guestGuard={false}
    >
      <StudentCheckInReportPage />
    </AclGuard>
  );
}
