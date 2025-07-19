'use client';

export const dynamic = 'force-dynamic';

// ** Component Import
import StudentEditPage from '@/views/apps/student/edit/StudentEditPage';

interface StudentEditPageWrapperProps {
  id: string;
}

export default function StudentEditPageWrapper({ id }: StudentEditPageWrapperProps) {
  return <StudentEditPage id={id} />;
}