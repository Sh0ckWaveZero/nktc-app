import { relations } from 'drizzle-orm/relations';
import {
  accounts,
  activityCheckInReport,
  classroom,
  classroomToLevelClassroom,
  classroomToTeacher,
  course,
  department,
  level,
  levelClassroom,
  program,
  reportCheckIn,
  rolePermission,
  session,
  student,
  teacher,
  user,
  userRole,
  verificationTokens,
} from './schema';

export const classroomToLevelClassroomRelations = relations(
  classroomToLevelClassroom,
  ({ one }) => ({
    classroom: one(classroom, {
      fields: [classroomToLevelClassroom.a],
      references: [classroom.id],
    }),
    levelClassroom: one(levelClassroom, {
      fields: [classroomToLevelClassroom.b],
      references: [levelClassroom.id],
    }),
  }),
);

export const classroomRelations = relations(classroom, ({ one, many }) => ({
  classroomToLevelClassrooms: many(classroomToLevelClassroom),
  activityCheckInReports: many(activityCheckInReport),
  students: many(student),
  department: one(department, {
    fields: [classroom.departmentId],
    references: [department.id],
  }),
  level: one(level, {
    fields: [classroom.levelId],
    references: [level.id],
  }),
  program: one(program, {
    fields: [classroom.programId],
    references: [program.id],
  }),
  courses: many(course),
  reportCheckIns: many(reportCheckIn),
  classroomToTeachers: many(classroomToTeacher),
}));

export const levelClassroomRelations = relations(
  levelClassroom,
  ({ one, many }) => ({
    classroomToLevelClassrooms: many(classroomToLevelClassroom),
    teachers: many(teacher),
    students: many(student),
    level: one(level, {
      fields: [levelClassroom.levelId],
      references: [level.id],
    }),
    program: one(program, {
      fields: [levelClassroom.programId],
      references: [program.id],
    }),
  }),
);

export const activityCheckInReportRelations = relations(
  activityCheckInReport,
  ({ one }) => ({
    classroom: one(classroom, {
      fields: [activityCheckInReport.classroomKey],
      references: [classroom.id],
    }),
    teacher: one(teacher, {
      fields: [activityCheckInReport.teacherKey],
      references: [teacher.id],
    }),
  }),
);

export const teacherRelations = relations(teacher, ({ one, many }) => ({
  activityCheckInReports: many(activityCheckInReport),
  department: one(department, {
    fields: [teacher.departmentId],
    references: [department.id],
  }),
  program: one(program, {
    fields: [teacher.programId],
    references: [program.id],
  }),
  user: one(user, {
    fields: [teacher.userId],
    references: [user.id],
  }),
  levelClassroom: one(levelClassroom, {
    fields: [teacher.levelClassroomId],
    references: [levelClassroom.id],
  }),
  reportCheckIns: many(reportCheckIn),
  classroomToTeachers: many(classroomToTeacher),
}));

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),
  rolePermission: one(rolePermission, {
    fields: [userRole.rolePermissionId],
    references: [rolePermission.id],
  }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  userRoles: many(userRole),
  verificationToken: one(verificationTokens, {
    fields: [user.verificationToken],
    references: [verificationTokens.token],
  }),
  teachers: many(teacher),
  sessions: many(session),
  students: many(student),
  accounts: many(accounts),
}));

export const rolePermissionRelations = relations(
  rolePermission,
  ({ many }) => ({
    userRoles: many(userRole),
  }),
);

export const verificationTokensRelations = relations(
  verificationTokens,
  ({ many }) => ({
    users: many(user),
  }),
);

export const departmentRelations = relations(department, ({ many }) => ({
  teachers: many(teacher),
  students: many(student),
  classrooms: many(classroom),
  programs: many(program),
}));

export const programRelations = relations(program, ({ one, many }) => ({
  teachers: many(teacher),
  students: many(student),
  levelClassrooms: many(levelClassroom),
  classrooms: many(classroom),
  courses: many(course),
  department: one(department, {
    fields: [program.departmentId],
    references: [department.id],
  }),
  level: one(level, {
    fields: [program.levelId],
    references: [level.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const studentRelations = relations(student, ({ one }) => ({
  classroom: one(classroom, {
    fields: [student.classroomId],
    references: [classroom.id],
  }),
  department: one(department, {
    fields: [student.departmentId],
    references: [department.id],
  }),
  level: one(level, {
    fields: [student.levelId],
    references: [level.id],
  }),
  program: one(program, {
    fields: [student.programId],
    references: [program.id],
  }),
  user: one(user, {
    fields: [student.userId],
    references: [user.id],
  }),
  levelClassroom: one(levelClassroom, {
    fields: [student.levelClassroomId],
    references: [levelClassroom.id],
  }),
}));

export const levelRelations = relations(level, ({ many }) => ({
  students: many(student),
  levelClassrooms: many(levelClassroom),
  classrooms: many(classroom),
  programs: many(program),
}));

export const courseRelations = relations(course, ({ one }) => ({
  program: one(program, {
    fields: [course.programId],
    references: [program.id],
  }),
  classroom: one(classroom, {
    fields: [course.classroomId],
    references: [classroom.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(user, {
    fields: [accounts.userId],
    references: [user.id],
  }),
}));

export const reportCheckInRelations = relations(reportCheckIn, ({ one }) => ({
  classroom: one(classroom, {
    fields: [reportCheckIn.classroomKey],
    references: [classroom.id],
  }),
  teacher: one(teacher, {
    fields: [reportCheckIn.teacherKey],
    references: [teacher.id],
  }),
}));

export const classroomToTeacherRelations = relations(
  classroomToTeacher,
  ({ one }) => ({
    classroom: one(classroom, {
      fields: [classroomToTeacher.a],
      references: [classroom.id],
    }),
    teacher: one(teacher, {
      fields: [classroomToTeacher.b],
      references: [teacher.id],
    }),
  }),
);
