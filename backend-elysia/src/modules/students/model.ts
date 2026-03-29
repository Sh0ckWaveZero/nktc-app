import { t, type UnwrapSchema } from "elysia";
import { userPublicSelect } from "@/libs/prisma/userSelectExclude";

export const StudentModel = {
  searchParams: t.Object({
    q: t.Optional(t.String()),
    classroomId: t.Optional(t.String()),
    departmentId: t.Optional(t.String()),
    programId: t.Optional(t.String()),
    search: t.Optional(
      t.Object({
        fullName: t.Optional(t.String()),
        studentId: t.Optional(t.String()),
      }),
    ),
    skip: t.Optional(t.Numeric()),
    take: t.Optional(t.Numeric()),
  }),
  createBody: t.Object({
    studentId: t.String(),
    status: t.Optional(t.String()),
    studentStatus: t.Optional(t.String()),
    group: t.Optional(t.String()),
    isGraduation: t.Optional(t.Boolean()),
    graduationYear: t.Optional(t.Integer()),
    graduationDate: t.Optional(t.Union([t.String(), t.Date(), t.Null()])),
    classroomId: t.Optional(t.String()),
    departmentId: t.Optional(t.String()),
    programId: t.Optional(t.String()),
    levelId: t.Optional(t.String()),
  }),
  uploadBody: t.Object({
    file: t.String(),
  }),
  updateBody: t.Object({
    studentId: t.Optional(t.String()),
    status: t.Optional(t.String()),
    studentStatus: t.Optional(t.String()),
    group: t.Optional(t.String()),
    isGraduation: t.Optional(t.Boolean()),
    graduationYear: t.Optional(t.Integer()),
    graduationDate: t.Optional(t.Union([t.String(), t.Date(), t.Null()])),
    classroomId: t.Optional(t.String()),
    departmentId: t.Optional(t.String()),
    programId: t.Optional(t.String()),
    levelId: t.Optional(t.String()),
    account: t.Optional(
      t.Object({
        title: t.Optional(t.String()),
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        idCard: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        birthDate: t.Optional(t.Union([t.String(), t.Date(), t.Null()])),
        addressLine1: t.Optional(t.String()),
        subdistrict: t.Optional(t.String()),
        district: t.Optional(t.String()),
        province: t.Optional(t.String()),
        postcode: t.Optional(t.String()),
        avatar: t.Optional(t.Nullable(t.String())),
      }),
    ),
  }),
} as const;

export type StudentModel = {
  [k in keyof typeof StudentModel]: UnwrapSchema<(typeof StudentModel)[k]>;
};

export const studentInclude = {
  user: { select: userPublicSelect },
  classroom: { include: { program: true, department: true, level: true } },
  program: true,
  department: true,
  level: true,
} as const;
