// ** Component Import
import UserViewPageWrapper from './UserViewPageWrapper';

export async function generateStaticParams() {
  return [];
}

interface UserViewProps {
  params: Promise<{ id: string }>;
}

export default async function UserView({ params }: UserViewProps) {
  const { id } = await params;
  return <UserViewPageWrapper id={id} />;
}