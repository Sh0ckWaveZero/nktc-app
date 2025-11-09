import { Classroom } from '@/types/apps/teacherTypes';

// ** Types
export interface LoginCountByUser {
  date: string;
  count: number;
}

export interface Teacher {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  title?: string;
  avatar?: string;
  loginCountByUser?: LoginCountByUser[];
  teacherOnClassroom?: string[];
  classrooms?: string[];
  accountId?: string;
  teacherId?: string;
  status?: string | boolean;
  [key: string]: unknown;
}

export type TeacherArray = Teacher[];

export type TeacherResponse =
  | TeacherArray
  | { data: TeacherArray }
  | { teachers: TeacherArray }
  | { items: TeacherArray }
  | null
  | undefined;

export interface UpdateClassroomInfo {
  id: string;
  classrooms: string[];
  teacherInfo?: string;
}

export interface AddTeacherInfo {
  fullName: string;
  password: string;
  [key: string]: unknown;
}

export interface UpdateTeacherBody {
  user: { id?: string };
  teacher: Teacher;
  account: { id?: string };
}

// ** Helper Functions
export const extractTeacherArray = (data: TeacherResponse): TeacherArray => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === 'object') {
    if ('data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    if ('teachers' in data && Array.isArray(data.teachers)) {
      return data.teachers;
    }
    if ('items' in data && Array.isArray(data.items)) {
      return data.items;
    }
  }

  return [];
};

export const getFullName = (teacher: Teacher): string => {
  const { title, firstName, lastName } = teacher;
  return `${title || ''}${firstName} ${lastName}`.trim();
};

export const getClassroomDefaultValues = (
  currentData: Teacher | null,
  classrooms: Classroom[]
): Classroom[] => {
  if (!currentData?.teacherOnClassroom) {
    return [];
  }

  return classrooms.filter((item: Classroom) => {
    const classroomId = item.id || item.classroomId;
    return classroomId && currentData.teacherOnClassroom?.includes(classroomId);
  });
};

