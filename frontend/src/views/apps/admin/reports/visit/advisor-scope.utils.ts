interface AdvisorScopeTeacher {
  teacherOnClassroom?: unknown;
}

interface AdvisorScopeClassroom {
  id: string;
  _count?: {
    student?: number | null;
  } | null;
}

const getAssignmentClassroomId = (assignment: unknown): string | null => {
  if (typeof assignment === 'string' && assignment.trim().length > 0) {
    return assignment;
  }

  if (assignment && typeof assignment === 'object') {
    const classroomId = 'classroomId' in assignment ? assignment.classroomId : undefined;

    if (typeof classroomId === 'string' && classroomId.trim().length > 0) {
      return classroomId;
    }

    const id = 'id' in assignment ? assignment.id : undefined;

    if (typeof id === 'string' && id.trim().length > 0) {
      return id;
    }
  }

  return null;
};

export const getAdvisorScopeStudentTotal = (
  teachers: readonly AdvisorScopeTeacher[],
  classrooms: readonly AdvisorScopeClassroom[],
) => {
  const classroomStudentCountById = new Map(
    classrooms.map((classroom) => [classroom.id, classroom._count?.student ?? 0] as const),
  );
  const advisorClassroomIds = new Set<string>();

  for (const teacher of teachers) {
    const assignments = Array.isArray(teacher.teacherOnClassroom) ? teacher.teacherOnClassroom : [];

    for (const assignment of assignments) {
      const classroomId = getAssignmentClassroomId(assignment);

      if (classroomId && classroomStudentCountById.has(classroomId)) {
        advisorClassroomIds.add(classroomId);
      }
    }
  }

  return [...advisorClassroomIds].reduce(
    (sum, classroomId) => sum + (classroomStudentCountById.get(classroomId) ?? 0),
    0,
  );
};