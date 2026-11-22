import { t } from "elysia";

const date = t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" });
const term = t.Union([t.Literal(1), t.Literal(2)]);
const category = t.Union([
  t.Literal("holiday"),
  t.Literal("activity"),
  t.Literal("exam"),
  t.Literal("meeting"),
]);

export const CalendarModel = {
  settings: t.Object({
    academicYear: t.Integer({ minimum: 544, maximum: 9999 }),
    selectedTerm: term,
    term1Start: date,
    term2Start: date,
    term1Name: t.String({ minLength: 1, maxLength: 100 }),
    term2Name: t.String({ minLength: 1, maxLength: 100 }),
    startWeekOnMonday: t.Boolean(),
  }, { additionalProperties: false }),
  event: t.Object({
    title: t.String({ minLength: 1, maxLength: 150 }),
    category,
    startDate: date,
    endDate: date,
    description: t.Optional(t.String({ maxLength: 1000 })),
  }, { additionalProperties: false }),
  eventQuery: t.Object({
    from: t.Optional(date),
    to: t.Optional(date),
    startsFrom: t.Optional(date),
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  }, { additionalProperties: false }),
  yearParams: t.Object({
    year: t.String({ pattern: "^\\d{4}$" }),
  }),
};

export type CalendarSettingsInput = typeof CalendarModel.settings.static;
export type CalendarEventInput = typeof CalendarModel.event.static;
export type CalendarEventQuery = typeof CalendarModel.eventQuery.static;
