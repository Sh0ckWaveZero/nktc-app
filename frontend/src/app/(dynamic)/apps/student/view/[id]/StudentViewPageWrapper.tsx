'use client';

export const dynamic = 'force-dynamic';

// ** Component Import
import StudentViewPage from '@/views/apps/student/view/StudentViewPage';

interface StudentViewPageWrapperProps {
  id: string;
}

export default function StudentViewPageWrapper({ id }: StudentViewPageWrapperProps) {
  return <StudentViewPage id={id} />;
}