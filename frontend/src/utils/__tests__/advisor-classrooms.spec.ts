import { describe, expect, it } from 'vitest';

import { getAdvisorClassroomIds } from '../advisor-classrooms';

describe('getAdvisorClassroomIds', () => {
  it('combines direct assignments and teacher classroom relations without duplicates', () => {
    const user = {
      teacherOnClassroom: ['class-1', { classroomId: 'class-2' }, { id: 'class-3' }],
      teacher: {
        classrooms: [
          { classroomId: 'class-2' },
          { classroom: { id: 'class-4' } },
          { id: 'class-5' },
        ],
      },
    };

    expect(getAdvisorClassroomIds(user)).toEqual(['class-1', 'class-2', 'class-3', 'class-4', 'class-5']);
  });

  it('returns an empty list when the user has no advisor classrooms', () => {
    expect(getAdvisorClassroomIds(null)).toEqual([]);
    expect(getAdvisorClassroomIds({})).toEqual([]);
  });
});