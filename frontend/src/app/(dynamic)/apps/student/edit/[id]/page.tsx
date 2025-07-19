// ** Component Import
import StudentEditPageWrapper from './StudentEditPageWrapper';

export async function generateStaticParams() {
  return [];
}

interface StudentEditProps {
  params: Promise<{ id: string }>;
}

export default async function StudentEdit({ params }: StudentEditProps) {
  const { id } = await params;
  return <StudentEditPageWrapper id={id} />;
}
