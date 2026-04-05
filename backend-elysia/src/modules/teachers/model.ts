import { t, type UnwrapSchema } from "elysia";
import { userPublicSelect } from "@/libs/prisma/userSelectExclude";

export const TeacherModel = {
  searchQuery: t.Object({
    q: t.Optional(t.String()),
    skip: t.Optional(t.Numeric()),
    take: t.Optional(t.Numeric()),
  }),
  uploadBody: t.Object({
    file: t.String(),
  }),
  classroomsBody: t.Object({
    classrooms: t.Array(t.String()),
  }),
  createBody: t.Object({
    user: t.Object({
      id: t.String(),
    }),
    teacher: t.Object({
      username: t.String(),
      password: t.String(),
      fullName: t.Optional(t.String()),
      firstName: t.String(),
      lastName: t.String(),
      title: t.Optional(t.String()),
      idCard: t.Optional(t.String()),
      birthDate: t.Optional(t.Union([t.String(), t.Null()])),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      jobTitle: t.Optional(t.String()),
      academicStanding: t.Optional(t.String()),
      role: t.String(),
      status: t.Optional(t.String()),
    }),
    account: t.Optional(t.Object({})),
  }),
  updateBody: t.Object({
    user: t.Object({
      id: t.String(),
    }),
    teacher: t.Object({
      id: t.String(),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      title: t.Optional(t.String()),
      idCard: t.Optional(t.String()),
      birthDate: t.Optional(t.Union([t.String(), t.Null()])),
      jobTitle: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
    account: t.Optional(
      t.Object({
        id: t.Optional(t.String()),
      }),
    ),
  }),
} as const;

export type TeacherModel = {
  [k in keyof typeof TeacherModel]: UnwrapSchema<(typeof TeacherModel)[k]>;
};

export const teacherInclude = {
  user: {
    select: {
      ...userPublicSelect,
      email: true,
    },
  },
  department: true,
  program: true,
  classrooms: {
    include: {
      classroom: {
        include: {
          program: true,
          department: true,
          level: true,
        },
      },
    },
  },
} as const;
