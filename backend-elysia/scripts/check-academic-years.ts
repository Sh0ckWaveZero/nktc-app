import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { Elysia } from "elysia";

import { prisma, unscopedPrisma } from "../src/libs/prisma";
import { getAcademicYearContext, withAcademicYearContext } from "../src/libs/academic-year-context";
import { academicYears } from "../src/modules/academic-years";
import { withAcademicYearRequest } from "../src/modules/academic-years/request-scope";
import { AcademicCalendarService } from "../src/modules/academic-calendar/service";
import { AcademicYearsService } from "../src/modules/academic-years/service";
import { BadnessService } from "../src/modules/badness-individual/service";
import { GoodnessService } from "../src/modules/goodness-individual/service";
import { VisitService } from "../src/modules/visits/service";
import { errorHandler } from "../src/plugins/error-handler";

// This worker changes active years. It only accepts an explicitly named test DB.
const databaseName = new URL(process.env.DATABASE_URL ?? "").pathname;
assert.match(databaseName, /^\/nktc_academic_year_test_/);
const secret = process.env.JWT_SECRET;
assert.ok(secret);

const tokenFor = (id: string): string => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now() / 1000) + 600 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
};

const counts = async () => ({
  attendance: await prisma.reportCheckIn.count(), activities: await prisma.activityCheckInReport.count(),
  visits: await prisma.visitStudent.count(), goodness: await prisma.goodnessIndividual.count(),
  badness: await prisma.badnessIndividual.count(), events: await prisma.academicCalendarEvent.count(),
});
const initial = await unscopedPrisma.academicYearState.findUniqueOrThrow({ where: { id: "current" } });
const oldYear = initial.academicYear;
const oldContext = { academicYear: oldYear, activeAcademicYear: oldYear, version: initial.version, expectedVersion: initial.version };
const registered = await unscopedPrisma.academicYear.aggregate({ _max: { academicYear: true } });
const nextYear = Math.max(oldYear, registered._max.academicYear ?? oldYear) + 1;
const [admin, teacher, student, room] = await Promise.all([
  unscopedPrisma.user.findFirstOrThrow({ where: { role: "Admin", status: "active" } }),
  unscopedPrisma.user.findFirstOrThrow({ where: { role: "Teacher", status: "active" } }),
  unscopedPrisma.student.findFirstOrThrow({ where: { classroomId: { not: null } } }),
  unscopedPrisma.classroom.findFirstOrThrow(),
]);
assert.ok(student.studentId);
const rosters = async () => Promise.all([
  prisma.student.count(), prisma.teacher.count(), prisma.classroom.count(), prisma.department.count(), prisma.program.count(),
]);
const initialRosters = await rosters();

await unscopedPrisma.reportCheckIn.create({ data: { teacherId: teacher.id, classroomId: room.id, present: [student.studentId], checkInDate: new Date() } });
await unscopedPrisma.activityCheckInReport.create({ data: { teacherId: teacher.id, classroomId: room.id, present: [student.studentId], checkInDate: new Date() } });
await unscopedPrisma.goodnessIndividual.create({ data: { studentKey: student.id, studentId: student.studentId, goodnessScore: 10 } });
const oldBadness = await unscopedPrisma.badnessIndividual.create({ data: { studentKey: student.id, studentId: student.studentId, badnessScore: 3 } });
await unscopedPrisma.visitStudent.create({ data: { studentKey: student.id, studentId: student.studentId, academicYear: String(oldYear), visitNo: 1 } });
await unscopedPrisma.academicCalendarEvent.create({ data: { title: "Year scope integration fixture", category: "activity", startDate: new Date(), endDate: new Date() } });
const beforeCounts = await withAcademicYearContext(oldContext, counts);
assert.ok(Object.values(beforeCounts).every((value) => value > 0));

const app = new Elysia().use(errorHandler).group("/api", (routes) => routes
  .use(academicYears)
  .get("/scope-probe", async () => ({
    context: getAcademicYearContext(), counts: await counts(), calendar: await AcademicCalendarService.getSettings(),
    student: await prisma.student.findUniqueOrThrow({ where: { id: student.id }, select: {
      id: true, goodnessIndividual: true, badnessIndividual: { select: { id: true } }, VisitStudent: true,
    } }),
  }))
  .post("/scope-probe", () => BadnessService.create({ studentId: student.studentId, studentKey: student.id, badnessScore: 5 }))
  .patch("/scope-probe/:id", ({ params }) => prisma.badnessIndividual.update({ where: { id: params.id }, data: { badnessScore: 8 } }))
  .delete("/scope-probe/:id", ({ params }) => prisma.badnessIndividual.delete({ where: { id: params.id } }))
  .get("/outside-years", () => ({ ok: true })),
);

const adminToken = tokenFor(admin.id);
const teacherToken = tokenFor(teacher.id);
const request = async (path: string, options: { method?: string; body?: unknown; year?: number; version?: number; token?: string } = {}): Promise<Response> => {
  const input = new Request(`http://localhost/api${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${options.token ?? adminToken}`,
      ...(options.year ? { "X-Academic-Year": String(options.year) } : {}),
      ...(options.version ? { "X-Academic-Year-Version": String(options.version) } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  return withAcademicYearRequest(input, () => app.handle(input));
};

try {
  assert.equal((await request("/academic-years/context", { token: teacherToken })).status, 200);
  assert.equal((await request("/academic-years/", { token: teacherToken })).status, 403);
  assert.equal((await request("/outside-years", { token: teacherToken })).status, 200);
  const context = await (await request("/academic-years/context")).json() as { activeAcademicYear: number; years: { academicYear: number }[] };
  assert.equal(context.activeAcademicYear, oldYear);
  console.log("PASS context authentication and local Admin restriction");

  const calendar = {
    academicYear: nextYear, selectedTerm: 1, term1Start: `${nextYear - 543}-05-17`,
    term2Start: `${nextYear - 543}-10-25`, term1Name: `ภาคเรียนที่ 1/${nextYear}`,
    term2Name: `ภาคเรียนที่ 2/${nextYear}`, startWeekOnMonday: true,
  };
  assert.equal((await request("/academic-years/", { method: "POST", body: { ...calendar, term1Start: "2026-02-31" } })).status, 400);
  assert.equal((await request("/academic-years/", { method: "POST", body: calendar })).status, 201);
  assert.equal((await request("/academic-years/", { method: "POST", body: calendar })).status, 409);
  const stillCurrent = await AcademicYearsService.getContext();
  assert.equal(stillCurrent.activeAcademicYear, oldYear);
  assert.ok(!stillCurrent.years.some((year) => year.academicYear === nextYear));
  assert.equal((await request("/scope-probe", { year: nextYear })).status, 404);
  console.log("PASS draft creation validates dates and does not activate the new year");

  const initialProbe = await (await request("/scope-probe", { year: oldYear })).json() as { counts: typeof beforeCounts; student: { goodnessIndividual: unknown[] } };
  assert.deepEqual(initialProbe.counts, beforeCounts);
  assert.ok(initialProbe.student.goodnessIndividual.length > 0);
  assert.equal((await request(`/academic-years/${nextYear}/activate`, { method: "POST", body: { expectedVersion: initial.version + 1 } })).status, 409);
  const confirmations = await Promise.all([1, 2].map(() => request(`/academic-years/${nextYear}/activate`, {
    method: "POST", body: { expectedVersion: initial.version },
  })));
  assert.deepEqual(confirmations.map((response) => response.status).sort(), [200, 409]);
  const current = await unscopedPrisma.academicYearState.findUniqueOrThrow({ where: { id: "current" } });
  assert.equal(current.academicYear, nextYear);
  assert.equal(current.version, initial.version + 1);
  assert.equal((await unscopedPrisma.academicCalendarState.findUniqueOrThrow({ where: { id: "current" } })).academicYear, nextYear);
  console.log("PASS atomic activation and concurrent/stale confirmation protection");

  const active = await (await request("/scope-probe")).json() as {
    counts: typeof beforeCounts; calendar: { academicYear: number };
    student: { id: string; goodnessIndividual: unknown[]; badnessIndividual: unknown[]; VisitStudent: unknown[] };
  };
  assert.deepEqual(Object.values(active.counts), [0, 0, 0, 0, 0, 0]);
  assert.equal(active.calendar.academicYear, nextYear);
  assert.equal(active.student.id, student.id);
  assert.deepEqual(active.student.goodnessIndividual, []);
  assert.deepEqual(active.student.badnessIndividual, []);
  assert.deepEqual(active.student.VisitStudent, []);
  assert.deepEqual(await rosters(), initialRosters);
  console.log("PASS all six record types and nested scores start empty; five shared rosters are unchanged");

  const nowContext = { academicYear: nextYear, activeAcademicYear: nextYear, version: current.version, expectedVersion: current.version };
  const sharedSelect = { id: true, goodnessIndividual: { select: { goodnessScore: true } } } as const;
  const parallelStudents = await Promise.all(Array.from({ length: 24 }, (_, index) =>
    withAcademicYearContext({ ...nowContext, academicYear: index % 2 === 0 ? nextYear : oldYear }, () =>
      prisma.student.findUniqueOrThrow({ where: { id: student.id }, select: sharedSelect })),
  ));
  for (const [index, result] of parallelStudents.entries()) {
    assert.equal(result.goodnessIndividual.length > 0, index % 2 !== 0);
  }
  assert.deepEqual(sharedSelect, { id: true, goodnessIndividual: { select: { goodnessScore: true } } });
  console.log("PASS concurrent requests keep shared relation selections isolated");


  const history = await (await request("/scope-probe", { year: oldYear })).json() as { counts: typeof beforeCounts };
  assert.deepEqual(history.counts, beforeCounts);
  for (const method of ["POST", "PATCH", "DELETE"]) {
    const response = await request(method === "POST" ? "/scope-probe" : `/scope-probe/${oldBadness.id}`, { method, year: oldYear, version: current.version });
    assert.equal(response.status, 409);
  }
  assert.equal((await request("/scope-probe", { method: "POST", version: initial.version })).status, 409);
  assert.equal((await request("/scope-probe", { method: "POST" })).status, 409);
  await assert.rejects(unscopedPrisma.badnessIndividual.update({ where: { id: oldBadness.id }, data: { badnessScore: 999 } }));
  await assert.rejects(withAcademicYearContext(nowContext, () => prisma.badnessIndividual.update({ where: { id: oldBadness.id }, data: { badnessScore: 999 } })));
  console.log("PASS historical reads, read-only guards, stale-client rejection and database archive protection");

  assert.equal((await request("/scope-probe", { method: "POST", version: current.version })).status, 200);
  const advisor = await unscopedPrisma.teacherOnClassroom.findFirstOrThrow({
    where: { classroomId: student.classroomId!, teacher: { userId: { not: null } } },
    select: { teacher: { select: { userId: true } } },
  });
  assert.ok(advisor.teacher.userId);
  const newVisit = await withAcademicYearContext(nowContext, () => VisitService.create(advisor.teacher.userId!, {
    studentKey: student.id, studentId: student.studentId!, classroomId: student.classroomId!,
    visitDate: new Date().toISOString(), images: ["fixture-1", "fixture-2", "fixture-3"], academicYear: String(oldYear), visitDetail: {},
  }));
  assert.equal(newVisit.visitNo, 1);
  assert.equal(newVisit.academicYear, String(nextYear));
  assert.equal(newVisit.academicYearId, nextYear);
  const afterHistory = await (await request("/scope-probe", { year: oldYear })).json() as { counts: typeof beforeCounts };
  assert.deepEqual(afterHistory.counts, beforeCounts);
  assert.equal((await unscopedPrisma.badnessIndividual.findUniqueOrThrow({ where: { id: oldBadness.id } })).badnessScore, 3);
  assert.deepEqual(await rosters(), initialRosters);
  console.log("PASS checked relation writes, visit numbering reset and legacy visit year normalization");
  await withAcademicYearContext(nowContext, () => GoodnessService.create({ studentKey: student.id, studentId: student.studentId, goodnessScore: 7 }));
  assert.deepEqual(await withAcademicYearContext(nowContext, () => GoodnessService.resetAllRecords(admin.id)), { deleted: 1 });
  assert.deepEqual(await withAcademicYearContext(nowContext, () => BadnessService.resetAllRecords(admin.id)), { deleted: 1 });
  await assert.rejects(withAcademicYearContext({ ...nowContext, academicYear: oldYear }, () => GoodnessService.resetAllRecords(admin.id)));
  const afterReset = await (await request("/scope-probe", { year: oldYear })).json() as { counts: typeof beforeCounts };
  assert.deepEqual(afterReset.counts, beforeCounts);
  console.log("PASS score reset only affects the active year and preserves archived scores");
  console.log(JSON.stringify({ oldYear, newYear: nextYear, originalCounts: beforeCounts, sharedRosters: initialRosters }));
} finally {
  await unscopedPrisma.$disconnect();
}
