import { Elysia, t } from "elysia";

import { ForbiddenError } from "@/libs/errors";
import { authGuard } from "@/middleware/auth";

import { AttendanceSummaryService } from "./service";

export const attendanceSummary = new Elysia({ prefix: "/attendance-summary" })
  .use(authGuard)
  .onBeforeHandle(({ user }): void => {
    if (user?.roles !== "Admin") throw new ForbiddenError();
  })
  .get(
    "/options",
    (): Promise<
      Awaited<ReturnType<typeof AttendanceSummaryService.getOptions>>
    > => AttendanceSummaryService.getOptions(),
  )
  .get(
    "/term",
    ({ query }) =>
      AttendanceSummaryService.getSummary(
        query.academicYear,
        Number(query.term) as 1 | 2,
      ),
    {
      query: t.Object(
        {
          academicYear: t.Numeric({
            minimum: 544,
            maximum: 9999,
            multipleOf: 1,
          }),
          term: t.Union([t.Literal("1"), t.Literal("2")]),
        },
        { additionalProperties: false },
      ),
      detail: {
        tags: ["Attendance"],
        summary: "Summarize flagpole attendance for a configured academic term",
      },
    },
  );
