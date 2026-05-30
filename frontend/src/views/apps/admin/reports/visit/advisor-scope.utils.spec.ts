import { describe, expect, it } from 'vitest';

import { getAdvisorScopeStudentTotal } from './advisor-scope.utils';

describe('getAdvisorScopeStudentTotal', () => {
  it('counts only classrooms referenced by advisor-teacher assignments', () => {
    const teachers = [
      { teacherOnClassroom: ['class-1'] },
      { teacherOnClassroom: [] },
      {},
    ];
    const classrooms = [
      { id: 'class-1', _count: { student: 20 } },
      { id: 'class-2', _count: { student: 23 } },
    ];

    expect(getAdvisorScopeStudentTotal(teachers, classrooms)).toBe(20);
  });

  it('deduplicates classrooms when multiple teachers reference the same advisor room', () => {
    const teachers = [
      { teacherOnClassroom: ['class-1', { classroomId: 'class-2' }] },
      { teacherOnClassroom: [{ id: 'class-2' }] },
    ];
    const classrooms = [
      { id: 'class-1', _count: { student: 20 } },
      { id: 'class-2', _count: { student: 23 } },
    ];

    expect(getAdvisorScopeStudentTotal(teachers, classrooms)).toBe(43);
  });
});