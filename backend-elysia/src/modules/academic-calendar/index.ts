import { Elysia } from "elysia";
import { UnauthorizedError } from "@/libs/errors";
import { requireRoles, type JwtPayload } from "@/middleware/rbac";
import { CalendarModel } from "./model";
import { AcademicCalendarService } from "./service";

const getUserId = (user: JwtPayload | null): string => {
  if (!user) throw new UnauthorizedError();
  return user.sub;
};

export const academicCalendar = new Elysia({ prefix: "/academic-calendar" })
  .use(requireRoles(["Admin"]))
  .guard(
    {
      detail: {
        tags: ["Academic Calendar"],
        security: [{ BearerAuth: [] }],
      },
    },
    (app) => app
      .get("/settings", async () => ({ settings: await AcademicCalendarService.getSettings() }))
      .get(
        "/settings/:year",
        async ({ params }) => ({ settings: await AcademicCalendarService.getSettingsForYear(Number(params.year)) }),
        { params: CalendarModel.yearParams },
      )
      .put(
        "/settings",
        ({ body, user }) => AcademicCalendarService.saveSettings(body, getUserId(user)),
        { body: CalendarModel.settings },
      )
      .get(
        "/events",
        ({ query }) => AcademicCalendarService.getEvents(query),
        { query: CalendarModel.eventQuery },
      )
      .post(
        "/events",
        async ({ body, user, set }) => {
          const event = await AcademicCalendarService.createEvent(body, getUserId(user));
          set.status = 201;
          return event;
        },
        { body: CalendarModel.event },
      )
      .put(
        "/events/:id",
        ({ params, body, user }) => AcademicCalendarService.updateEvent(params.id, body, getUserId(user)),
        { body: CalendarModel.event },
      )
      .delete("/events/:id", ({ params }) => AcademicCalendarService.deleteEvent(params.id)),
  );
