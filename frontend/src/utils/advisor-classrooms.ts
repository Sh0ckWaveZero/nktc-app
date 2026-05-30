type AdvisorClassroomSource = {
  id?: unknown;
  classroomId?: unknown;
  classroom?: {
    id?: unknown;
  } | null;
};

type AdvisorUserLike = {
  teacherOnClassroom?: unknown;
  teacher?: {
    classrooms?: unknown;
  } | null;
} | null;

const getAdvisorClassroomId = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const classroom = value as AdvisorClassroomSource;
  const classroomId = classroom.classroomId ?? classroom.id ?? classroom.classroom?.id;

  return typeof classroomId === 'string' && classroomId.trim() ? classroomId : null;
};

export const getAdvisorClassroomIds = (user: AdvisorUserLike) => {
  const directAssignments = Array.isArray(user?.teacherOnClassroom) ? user.teacherOnClassroom : [];
  const teacherClassrooms = Array.isArray(user?.teacher?.classrooms) ? user.teacher.classrooms : [];

  return Array.from(new Set([...directAssignments, ...teacherClassrooms].map(getAdvisorClassroomId).filter(Boolean)))
    .filter((classroomId): classroomId is string => Boolean(classroomId))
    .sort((left, right) => left.localeCompare(right));
};