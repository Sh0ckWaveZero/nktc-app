import { Course } from '@prisma/client'

export const courseData = () => {
  const startDate = new Date();
  const admin = {
    createdBy: 'Admin',
    updatedBy: 'Admin',
    updatedAt: startDate,
    createdAt: startDate,
  };
  return <Course[]>[
    {
      courseId: 'course_001',
      courseName: 'course1',
      status: 'description1',
      ...admin,
    }
  ]
}