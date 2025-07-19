// ** Component Import
import StudentViewPageWrapper from './StudentViewPageWrapper';

export async function generateStaticParams() {
  return [];
}

interface StudentViewProps {
  params: Promise<{ id: string }>;
}

export default async function StudentView({ params }: StudentViewProps) {
  const { id } = await params;
  return <StudentViewPageWrapper id={id} />;
}
