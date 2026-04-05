import { t, type UnwrapSchema } from "elysia";

export const ProgramModel = {
  programBody: t.Object({
    programId: t.String(),
    name: t.String(),
    description: t.Optional(t.String()),
    status: t.Optional(t.String()),
    departmentId: t.Optional(t.String()),
    levelId: t.Optional(t.String()),
  }),
  programPartial: t.Partial(
    t.Object({
      programId: t.String(),
      name: t.String(),
      description: t.Optional(t.String()),
      status: t.Optional(t.String()),
      departmentId: t.Optional(t.String()),
      levelId: t.Optional(t.String()),
    }),
  ),
  uploadBody: t.Object({
    file: t.String(),
  }),
} as const;

export type ProgramModel = {
  [k in keyof typeof ProgramModel]: UnwrapSchema<(typeof ProgramModel)[k]>;
};

export const programInclude = {
  department: true,
  level: true,
  _count: {
    select: {
      student: true,
      classroom: true,
      teacher: true,
      course: true,
      levelClassroom: true,
    },
  },
} as const;
