'use client';

// ** Component Import
import HistoryPage from '@/views/pages/history/HistoryPage';

// ** ACL Import
import AclGuard from '@/@core/components/auth/AclGuard';

export default function History() {
  return (
    <AclGuard
      aclAbilities={{
        action: 'read',
        subject: 'history-page',
      }}
      guestGuard={false}
    >
      <HistoryPage />
    </AclGuard>
  );
}
