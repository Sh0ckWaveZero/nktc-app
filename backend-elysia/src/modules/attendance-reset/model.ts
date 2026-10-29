import { t } from "elysia";

const termProperties = {
  academicYear: t.Integer({ minimum: 544, maximum: 9999 }),
  term: t.Union([t.Literal(1), t.Literal(2)]),
};

/** Schema สำหรับ Reset ภาคเรียน โดยบังคับประเภทกิจกรรมเมื่อรีเซ็ต Activity */
export const AttendanceResetModel = {
  flagpole: t.Object(termProperties, { additionalProperties: false }),
  activity: t.Object(
    {
      ...termProperties,
      activityType: t.Union([
        t.Literal("CLUB"),
        t.Literal("AST"),
        t.Literal("SCOUT"),
      ]),
    },
    { additionalProperties: false },
  ),
};
