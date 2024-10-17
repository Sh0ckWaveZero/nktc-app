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
  verificationtokens,
} from './schema';

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

export const classroomRelations = relations(classroom, ({ one, many }) => ({
  classroomToTeachers: many(classroomToTeacher),
  courses: many(course),
  reportCheckIns: many(reportCheckIn),
  classroomToLevelClassrooms: many(classroomToLevelClassroom),
  students: many(student),
  activityCheckInReports: many(activityCheckInReport),
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
}));

export const teacherRelations = relations(teacher, ({ one, many }) => ({
  classroomToTeachers: many(classroomToTeacher),
  reportCheckIns: many(reportCheckIn),
  department: one(department, {
    fields: [teacher.departmentId],
    references: [department.id],
  }),
  levelClassroom: one(levelClassroom, {
    fields: [teacher.levelClassroomId],
    references: [levelClassroom.id],
  }),
  program: one(program, {
    fields: [teacher.programId],
    references: [program.id],
  }),
  user: one(user, {
    fields: [teacher.userId],
    references: [user.id],
  }),
  activityCheckInReports: many(activityCheckInReport),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(user, {
    fields: [accounts.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  accounts: many(accounts),
  sessions: many(session),
  teachers: many(teacher),
  userRoles: many(userRole),
  students: many(student),
  verificationtoken: one(verificationtokens, {
    fields: [user.verificationToken],
    references: [verificationtokens.token],
  }),
}));

export const courseRelations = relations(course, ({ one }) => ({
  classroom: one(classroom, {
    fields: [course.classrommId],
    references: [classroom.id],
  }),
  program: one(program, {
    fields: [course.programId],
    references: [program.id],
  }),
}));

export const programRelations = relations(program, ({ one, many }) => ({
  courses: many(course),
  teachers: many(teacher),
  students: many(student),
  classrooms: many(classroom),
  levelClassrooms: many(levelClassroom),
  department: one(department, {
    fields: [program.departmentId],
    references: [department.id],
  }),
  level: one(level, {
    fields: [program.levelId],
    references: [level.id],
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

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const departmentRelations = relations(department, ({ many }) => ({
  teachers: many(teacher),
  students: many(student),
  classrooms: many(classroom),
  programs: many(program),
}));

export const levelClassroomRelations = relations(
  levelClassroom,
  ({ one, many }) => ({
    teachers: many(teacher),
    classroomToLevelClassrooms: many(classroomToLevelClassroom),
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

export const userRoleRelations = relations(userRole, ({ one }) => ({
  rolePermission: one(rolePermission, {
    fields: [userRole.rolePermisssionId],
    references: [rolePermission.id],
  }),
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),
}));

export const rolePermissionRelations = relations(
  rolePermission,
  ({ many }) => ({
    userRoles: many(userRole),
  }),
);

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

export const studentRelations = relations(student, ({ one }) => ({
  classroom: one(classroom, {
    fields: [student.classroomId],
    references: [classroom.id],
  }),
  department: one(department, {
    fields: [student.departmentId],
    references: [department.id],
  }),
  levelClassroom: one(levelClassroom, {
    fields: [student.levelClassroomId],
    references: [levelClassroom.id],
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
}));

export const levelRelations = relations(level, ({ many }) => ({
  students: many(student),
  classrooms: many(classroom),
  levelClassrooms: many(levelClassroom),
  programs: many(program),
}));

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

export const verificationtokensRelations = relations(
  verificationtokens,
  ({ many }) => ({
    users: many(user),
  }),
);
