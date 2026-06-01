import { useAuth } from '@/hooks/useAuth';
import { Roles, type Role } from '@/configs/roles';

export const useRole = () => {
  const { user } = useAuth();
  const role = user?.role as Role | undefined;

  return {
    role,
    isAdmin: role === Roles.Admin,
    isTeacher: role === Roles.Teacher,
    isStudent: role === Roles.Student,
    isParent: role === Roles.Parent,
  };
};
