import { t, type UnwrapSchema } from "elysia";

export const DepartmentModel = {
  departmentBody: t.Object({
    departmentId: t.String(),
    name: t.String(),
    description: t.Optional(t.String()),
    status: t.Optional(t.String()),
  }),
  departmentPartial: t.Partial(
    t.Object({
      name: t.String(),
      departmentId: t.Optional(t.String()),
      description: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
  ),
  uploadBody: t.Object({
    file: t.String(),
  }),
} as const;

export type DepartmentModel = {
  [k in keyof typeof DepartmentModel]: UnwrapSchema<
    (typeof DepartmentModel)[k]
  >;
};

export const departmentInclude = {
  _count: {
    select: {
      teacher: true,
      student: true,
      program: true,
      classroom: true,
    },
  },
} as const;
