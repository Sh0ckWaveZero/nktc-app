import { beforeEach, describe, expect, it, mock } from "bun:test";

process.env.JWT_SECRET = "test-jwt-secret-minimum-32-chars!!";

type YearData = {
  selectedTerm: number;
  term1Start: Date;
  term2Start: Date;
  term1Name: string;
  term2Name: string;
  startWeekOnMonday: boolean;
  updatedBy: string;
};
type YearRow = YearData & { academicYear: number; createdBy: string };
type EventData = {
  title: string;
  category: string;
  startDate: Date;
  endDate: Date;
  description: string | null;
  updatedBy: string;
};
type EventRow = EventData & { id: string; createdBy: string };
type EventWhere = { endDate?: { gte: Date }; startDate?: { gte?: Date; lte?: Date } };

const years = new Map<number, YearRow>();
const events = new Map<string, EventRow>();
let activeYear: number | null = null;
let nextEventId = 0;

const database = {
  academicYear: { upsert: mock(async () => ({})) },
  user: {
    findUnique: mock(async ({ where }: { where: { id: string } }) => ({
      id: where.id,
      username: where.id,
      role: where.id.startsWith("teacher") ? "Teacher" : "Admin",
      status: "active",
    })),
  },
  academicCalendarYear: {
    findUnique: mock(async ({ where }: { where: { academicYear: number } }) => years.get(where.academicYear) ?? null),
    upsert: mock(async ({ where, create, update }: {
      where: { academicYear: number };
      create: YearRow;
      update: YearData;
    }) => {
      const previous = years.get(where.academicYear);
      const year = previous ? { ...previous, ...update } : create;
      years.set(where.academicYear, year);
      return year;
    }),
  },
  academicCalendarState: {
    findUnique: mock(async () => activeYear === null ? null : { year: years.get(activeYear) }),
    upsert: mock(async ({ create, update }: {
      create: { academicYear: number };
      update: { academicYear: number };
    }) => {
      activeYear = activeYear === null ? create.academicYear : update.academicYear;
      return { academicYear: activeYear };
    }),
  },
  academicCalendarEvent: {
    findMany: mock(async ({ where, take }: { where: EventWhere; take?: number }) => {
      const rows = [...events.values()]
        .filter((event) => !where.endDate?.gte || event.endDate >= where.endDate.gte)
        .filter((event) => !where.startDate?.gte || event.startDate >= where.startDate.gte)
        .filter((event) => !where.startDate?.lte || event.startDate <= where.startDate.lte)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime() || a.title.localeCompare(b.title));
      return take ? rows.slice(0, take) : rows;
    }),
    create: mock(async ({ data }: { data: EventData & { createdBy: string } }) => {
      const event = { ...data, id: `event-${++nextEventId}` };
      events.set(event.id, event);
      return event;
    }),
    update: mock(async ({ where, data }: { where: { id: string }; data: EventData }) => {
      const previous = events.get(where.id);
      if (!previous) throw new Error("Missing test event");
      const event = { ...previous, ...data };
      events.set(where.id, event);
      return event;
    }),
    delete: mock(async ({ where }: { where: { id: string } }) => {
      events.delete(where.id);
    }),
  },
};

const prisma = {
  ...database,
  $transaction: async <T>(callback: (transaction: typeof database) => Promise<T>): Promise<T> => callback(database),
};

mock.module("@/libs/prisma", () => ({ prisma }));
mock.module("@/infrastructure/logging", () => ({
  logger: { info: mock(), warn: mock(), error: mock(), debug: mock() },
  createLogger: () => ({ info: mock(), warn: mock(), error: mock(), debug: mock() }),
}));

const { Elysia } = await import("elysia");
const { jwt } = await import("@elysiajs/jwt");
const { errorHandler } = await import("@/plugins/error-handler");
const { responsePlugin } = await import("@/plugins/response");
const { academicCalendar } = await import("@/modules/academic-calendar");
const app = new Elysia().use(errorHandler).use(responsePlugin).use(academicCalendar);

const signToken = async (sub: string): Promise<string> => {
  const response = await new Elysia()
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .get("/sign", ({ jwt: signer }) => signer.sign({ sub }))
    .handle(new Request("http://localhost/sign"));
  return response.text();
};

const adminToken = await signToken("admin-calendar");
const teacherToken = await signToken("teacher-calendar");

const request = (path: string, method = "GET", body?: unknown, token = adminToken) =>
  app.handle(new Request(`http://localhost/academic-calendar${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }));

const settings = {
  academicYear: 2569,
  selectedTerm: 1,
  term1Start: "2026-05-11",
  term2Start: "2026-10-26",
  term1Name: "ภาคเรียนที่ 1/2569",
  term2Name: "ภาคเรียนที่ 2/2569",
  startWeekOnMonday: true,
};

describe("academic calendar API", () => {
  beforeEach(() => {
    years.clear();
    events.clear();
    activeYear = null;
    nextEventId = 0;
  });

  it("allows only authenticated administrators to read or change the calendar", async () => {
    expect((await request("/settings", "GET", undefined, "")).status).toBe(401);
    expect((await request("/settings", "GET", undefined, teacherToken)).status).toBe(403);
    expect((await request("/events", "POST", {
      title: "Test", category: "activity", startDate: "2026-05-11", endDate: "2026-05-11",
    }, teacherToken)).status).toBe(403);
    const response = await request("/settings");
    expect(response.status).toBe(200);
    expect((await response.json() as { settings: null }).settings).toBeNull();
  });

  it("saves both terms and future calendars without changing the active academic year", async () => {
    activeYear = settings.academicYear;
    const first = await request("/settings", "PUT", settings);
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual(settings);

    const switched = { ...settings, selectedTerm: 2, term2Name: "เทอมสอง" };
    expect((await request("/settings", "PUT", switched)).status).toBe(200);
    const nextYear = {
      ...settings,
      academicYear: 2570,
      term1Start: "2027-05-10",
      term2Start: "2027-10-25",
    };
    expect((await request("/settings", "PUT", nextYear)).status).toBe(200);
    expect((await (await request("/settings")).json() as { settings: typeof settings }).settings).toEqual(switched);
    expect((await (await request("/settings/2570")).json() as { settings: typeof settings }).settings).toEqual(nextYear);
    expect(activeYear).toBe(2569);
    expect((await (await request("/settings/2569")).json() as { settings: typeof settings }).settings).toEqual(switched);
    expect((await (await request("/settings/2568")).json() as { settings: null }).settings).toBeNull();
    expect(years.get(2569)?.updatedBy).toBe("admin-calendar");
  });

  it("rejects impossible dates, reversed terms, and blank names without saving", async () => {
    expect((await request("/settings", "PUT", { ...settings, term1Start: "2026-02-31" })).status).toBe(400);
    expect((await request("/settings", "PUT", { ...settings, term2Start: "2026-05-10" })).status).toBe(400);
    expect((await request("/settings", "PUT", { ...settings, term1Name: "   " })).status).toBe(400);
    expect(years.size).toBe(0);
    expect(activeYear).toBeNull();
  });

  it("creates, filters, edits and deletes multi-day activities", async () => {
    const event = {
      title: "วันสอบ",
      category: "exam",
      startDate: "2026-05-30",
      endDate: "2026-06-02",
      description: "สอบปลายภาค",
    };
    const created = await request("/events", "POST", event);
    expect(created.status).toBe(201);
    const createdEvent = await created.json() as typeof event & { id: string };
    expect(createdEvent).toEqual({ ...event, id: "event-1" });

    const overlapping = await request("/events?from=2026-06-01&to=2026-06-30");
    expect((await overlapping.json() as Array<{ id: string }>).map((row) => row.id)).toEqual(["event-1"]);
    const upcoming = await request("/events?startsFrom=2026-06-01&limit=5");
    expect(await upcoming.json()).toEqual([]);
    expect((await request("/events?from=2026-06-30&to=2026-06-01")).status).toBe(400);

    const updated = await request(`/events/${createdEvent.id}`, "PUT", { ...event, title: "สอบแก้ตัว" });
    expect((await updated.json() as { title: string }).title).toBe("สอบแก้ตัว");
    expect((await request(`/events/${createdEvent.id}`, "DELETE")).status).toBe(200);
    expect(events.size).toBe(0);
  });

  it("rejects invalid event categories, dates, and whitespace titles", async () => {
    const event = { title: "กิจกรรม", category: "activity", startDate: "2026-05-11", endDate: "2026-05-11" };
    expect((await request("/events", "POST", { ...event, category: "other" })).status).toBe(422);
    expect((await request("/events", "POST", { ...event, endDate: "2026-05-10" })).status).toBe(400);
    expect((await request("/events", "POST", { ...event, title: "   " })).status).toBe(400);
    expect(events.size).toBe(0);
  });
});
