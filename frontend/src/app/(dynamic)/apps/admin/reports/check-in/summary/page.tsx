'use client';

import AclGuard from '@/@core/components/auth/AclGuard';
import TermAttendanceSummaryPage from '@/views/apps/admin/reports/check-in/summary/term-attendance-summary-page';

import type { ReactElement } from 'react';

const AdminAttendanceSummary = (): ReactElement => (
  <AclGuard aclAbilities={{ action: 'read', subject: 'admin-report-check-in-page' }} guestGuard={false}>
    <TermAttendanceSummaryPage />
  </AclGuard>
);

export default AdminAttendanceSummary;
