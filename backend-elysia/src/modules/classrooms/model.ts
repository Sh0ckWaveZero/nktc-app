import { t, type UnwrapSchema } from "elysia";

export const ClassroomModel = {
  body: t.Object({
    classroomId: t.String(),
    name: t.String(),
    description: t.Optional(t.String()),
    programId: t.Optional(t.String()),
    departmentId: t.Optional(t.String()),
    levelId: t.Optional(t.String()),
    status: t.Optional(t.String()),
  }),
  partial: t.Partial(
    t.Object({
      classroomId: t.String(),
      name: t.String(),
      description: t.Optional(t.String()),
      programId: t.Optional(t.String()),
      departmentId: t.Optional(t.String()),
      levelId: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
  ),
  uploadBody: t.Object({
    file: t.String(),
  }),
} as const;

export type ClassroomModel = {
  [k in keyof typeof ClassroomModel]: UnwrapSchema<(typeof ClassroomModel)[k]>;
};

export const classroomInclude = {
  program: true,
  department: true,
  level: true,
  _count: {
    select: {
      student: true,
      teachers: true,
      course: true,
      reportCheckIn: true,
      activityCheckInReport: true,
      levelClassrooms: true,
    },
  },
} as const;
