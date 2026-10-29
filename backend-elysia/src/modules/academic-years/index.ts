import { Elysia, t } from "elysia";
import { ForbiddenError } from "@/libs/errors";
import { authGuard } from "@/middleware/auth";
import { CalendarModel } from "../academic-calendar/model";
import { AcademicYearsService } from "./service";

export const academicYears = new Elysia({ prefix: "/academic-years" })
  .use(authGuard)
  .get("/context", () => AcademicYearsService.getContext())
  .guard({ beforeHandle: ({ user }) => {
    if (user?.roles !== "Admin") throw new ForbiddenError();
  } }, (app) => app
    .get("/", () => AcademicYearsService.getManagement())
    .post("/", ({ body, user, set }) => {
      set.status = 201;
      return AcademicYearsService.create(body, user!.sub);
    }, { body: CalendarModel.settings })
    .post("/:year/activate", ({ params, body, user }) =>
      AcademicYearsService.activate(params.year, body.expectedVersion, user!.sub), {
      params: t.Object({ year: t.Numeric({ minimum: 544, maximum: 9999, multipleOf: 1 }) }),
      body: t.Object({ expectedVersion: t.Integer({ minimum: 1 }) }, { additionalProperties: false }),
    }),
  );
