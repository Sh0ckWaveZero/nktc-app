interface StudentSortItem {
  id?: string | number | null;
  studentId?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  user?: {
    account?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
}

interface ClassroomWithStudents<TStudent extends StudentSortItem = StudentSortItem> {
  students?: readonly TStudent[] | null;
}

const STUDENT_ID_COLLATOR = new Intl.Collator('th', {
  numeric: true,
  sensitivity: 'base',
});

const getSortableText = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

const getStudentName = (student: StudentSortItem) => {
  const account = student.user?.account;
  return [account?.firstName ?? student.firstName, account?.lastName ?? student.lastName].map(getSortableText).join(' ').trim();
};

/**
 * Sort students by `studentId` with numeric-aware comparison.
 * ใช้กับรายการนักเรียนที่แสดงผลให้ครู เพื่อให้รหัสนักเรียนเรียงถูกต้องทั้ง desktop และ mobile
 */
export const compareStudentsByStudentId = (left: StudentSortItem, right: StudentSortItem) => {
  const leftStudentId = getSortableText(left.studentId);
  const rightStudentId = getSortableText(right.studentId);

  if (leftStudentId && !rightStudentId) return -1;
  if (!leftStudentId && rightStudentId) return 1;

  const studentIdResult = STUDENT_ID_COLLATOR.compare(leftStudentId, rightStudentId);
  if (studentIdResult !== 0) return studentIdResult;

  const nameResult = STUDENT_ID_COLLATOR.compare(getStudentName(left), getStudentName(right));
  if (nameResult !== 0) return nameResult;

  return STUDENT_ID_COLLATOR.compare(getSortableText(left.id), getSortableText(right.id));
};

/**
 * Return a new students array sorted by `studentId`.
 * ไม่ mutate array เดิม เพื่อไม่กระทบ React Query cache และ state เดิม
 */
export const sortStudentsByStudentId = <TStudent extends StudentSortItem>(students?: readonly TStudent[] | null) => {
  return [...(students ?? [])].sort(compareStudentsByStudentId);
};

/**
 * Sort `students` inside each classroom by `studentId`.
 * ใช้กับ response ห้องเรียนของครูเพื่อให้ทุกหน้าที่ consume classrooms ได้ลำดับเดียวกัน
 */
export const sortClassroomStudentsByStudentId = <TClassroom extends ClassroomWithStudents>(
  classrooms?: readonly TClassroom[] | null,
) => {
  return (classrooms ?? []).map((classroom) => {
    if (!Array.isArray(classroom.students)) {
      return classroom;
    }

    return {
      ...classroom,
      students: sortStudentsByStudentId(classroom.students),
    } as TClassroom;
  });
};
