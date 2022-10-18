import { Prisma } from '@prisma/client'
import { createByAdmin } from './utils';

export const courseData = () => {
  const admin = createByAdmin();
  return Prisma.validator<Prisma.CourseCreateInput[]>()(
    [
      {
        courseId: 'course_001',
        courseName: 'course1',
        status: 'description1',
        ...admin,
      }
    ]
  );
}