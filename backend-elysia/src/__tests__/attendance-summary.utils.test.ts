import { describe, expect, it } from "bun:test";

import {
  getAttendanceTermPeriod,
  summarizeAttendance,
} from "../modules/attendance-summary/summary-utils";
import type {
  AttendanceClassroom,
  AttendanceRecord,
  CalendarYear,
} from "../modules/attendance-summary/summary-utils";

const settings: CalendarYear = {
  academicYear: 2569,
  term1Start: new Date("2026-05-13T00:00:00Z"),
  term2Start: new Date("2026-10-28T00:00:00Z"),
  term1Name: "ภาคเรียนที่ 1/2569",
  term2Name: "ภาคเรียนที่ 2/2569",
  startWeekOnMonday: true,
};
const now: Date = new Date("2026-06-03T12:00:00+07:00");
const classrooms: AttendanceClassroom[] = [
  {
    id: "room-a",
    classroomId: "C001",
    name: "Classroom A",
    department: { id: "dept-a", name: "Department A" },
    level: { levelName: "Certificate" },
  },
  {
    id: "room-b",
    classroomId: "C002",
    name: "Classroom B",
    department: { id: "dept-b", name: "Department B" },
    level: { levelName: "Diploma" },
  },
];
const record = (
  overrides: Partial<AttendanceRecord> = {},
): AttendanceRecord => ({
  id: "record-a",
  classroomId: "C001",
  classroomKey: null,
  checkInDate: new Date("2026-05-14T00:00:00Z"),
  updatedAt: new Date("2026-05-14T06:00:00Z"),
  present: [],
  absent: [],
  late: [],
  leave: [],
  internship: [],
  ...overrides,
});

describe("attendance term period", () => {
  it("follows partial first weeks and the 18-week calendar end", () => {
    const result = getAttendanceTermPeriod(settings, 1, now);
    expect(result.period.startDate).toBe("2026-05-13");
    expect(result.period.endDate).toBe("2026-09-13");
    expect(result.weeks).toHaveLength(18);
    expect(result.weeks[0]).toEqual({
      week: 1,
      startDate: "2026-05-13",
      endDate: "2026-05-17",
    });
    expect(
      getAttendanceTermPeriod({ ...settings, startWeekOnMonday: false }, 1, now)
        .weeks[0].endDate,
    ).toBe("2026-05-19");
  });
  it("clips term 1 before term 2 and supports terms crossing calendar years", () => {
    expect(
      getAttendanceTermPeriod(
        { ...settings, term2Start: new Date("2026-06-10T00:00:00Z") },
        1,
        now,
      ).period.endDate,
    ).toBe("2026-06-09");
    const second = getAttendanceTermPeriod(
      settings,
      2,
      new Date("2027-01-01T00:00:00Z"),
    );
    expect(second.period.endDate).toBe("2027-02-28");
    expect(second.period.academicYear).toBe(2569);
  });
});

describe("student-day attendance statistics", () => {
  it("counts one student on multiple days as multiple observations and one unique student", () => {
    const result = summarizeAttendance(
      settings,
      1,
      [
        record({
          present: ["a", "b"],
          late: ["c"],
          absent: ["d"],
          leave: ["e"],
          internship: ["f"],
        }),
        record({
          id: "day-2",
          checkInDate: new Date("2026-05-15T00:00:00Z"),
          present: ["a"],
          absent: ["b"],
        }),
      ],
      classrooms,
      now,
    );
    expect(result.totals).toEqual({
      present: 3,
      late: 1,
      absent: 2,
      leave: 1,
      internship: 1,
      total: 8,
      punctualityRate: 50,
    });
    expect(result.uniqueStudents).toBe(6);
    expect(result.recordedDays).toBe(2);
    expect(result.weekly[0].total).toBe(8);
    expect(result.classrooms[0].name).toBe("Classroom A");
    expect(result.departments[0].total).toBe(8);
    expect(result.weekly.reduce((sum, week) => sum + week.total, 0)).toBe(
      result.totals.total,
    );
  });
  it("weights rates by observations rather than averaging daily percentages", () => {
    const result = summarizeAttendance(
      settings,
      1,
      [
        record({ present: ["a"] }),
        record({
          id: "day-2",
          checkInDate: new Date("2026-05-15T00:00:00Z"),
          present: ["a"],
          absent: ["b", "c", "d", "e", "f", "g", "h", "i"],
        }),
      ],
      classrooms,
      now,
    );
    expect(result.totals.punctualityRate).toBe(20);
  });
  it("uses the latest status for each student-day across teachers and classrooms", () => {
    const result = summarizeAttendance(
      settings,
      1,
      [
        record({
          id: "old",
          updatedAt: new Date("2026-05-14T05:00:00Z"),
          present: ["a", "b"],
          absent: ["c"],
        }),
        record({
          id: "new",
          classroomId: "room-b",
          updatedAt: new Date("2026-05-14T07:00:00Z"),
          absent: ["a"],
          present: ["c"],
        }),
      ],
      classrooms,
      now,
    );
    expect(result.totals.present).toBe(2);
    expect(result.totals.absent).toBe(1);
    expect(result.totals.total).toBe(3);
    expect(result.quality.duplicateEntries).toBe(2);
    expect(result.classrooms.find((room) => room.id === "room-b")?.total).toBe(
      2,
    );
  });
  it("excludes contradictory statuses in the latest report without restoring an outdated status", () => {
    const result = summarizeAttendance(
      settings,
      1,
      [
        record({ id: "new", present: ["a"], absent: ["a"] }),
        record({
          id: "old",
          updatedAt: new Date("2026-05-14T05:00:00Z"),
          present: ["a", "b"],
        }),
      ],
      classrooms,
      now,
    );
    expect(result.totals.total).toBe(1);
    expect(result.uniqueStudents).toBe(1);
    expect(result.quality.conflictingStudentDays).toBe(1);
  });
  it("deduplicates repeated IDs and ignores blank identifiers", () => {
    const result = summarizeAttendance(
      settings,
      1,
      [record({ present: ["a", "a", "", " "] })],
      classrooms,
      now,
    );
    expect(result.totals.total).toBe(1);
    expect(result.quality.duplicateEntries).toBe(1);
    expect(result.quality.invalidEntries).toBe(2);
  });
  it("uses Thai calendar days and excludes days before opening and after today", () => {
    const result = summarizeAttendance(
      settings,
      1,
      [
        record({
          id: "before",
          checkInDate: new Date("2026-05-12T16:59:59Z"),
          present: ["a"],
        }),
        record({
          id: "opening",
          checkInDate: new Date("2026-05-12T17:00:00Z"),
          present: ["a"],
        }),
        record({
          id: "today",
          checkInDate: new Date("2026-06-03T16:59:59Z"),
          present: ["a"],
        }),
        record({
          id: "future",
          checkInDate: new Date("2026-06-03T17:00:00Z"),
          absent: ["a"],
        }),
        record({ id: "undated", checkInDate: null, absent: ["a"] }),
      ],
      classrooms,
      now,
    );
    expect(result.totals.total).toBe(2);
    expect(result.totals.absent).toBe(0);
    expect(result.recordedDays).toBe(2);
  });
  it("keeps missing and future weeks empty and excludes leave and internship from the rate", () => {
    const result = summarizeAttendance(
      settings,
      1,
      [record({ leave: ["a"], internship: ["b"] })],
      classrooms,
      now,
    );
    expect(result.totals.total).toBe(2);
    expect(result.totals.punctualityRate).toBeNull();
    expect(result.weekly[1].total).toBe(0);
    expect(result.weekly[1].punctualityRate).toBeNull();
    expect(
      summarizeAttendance(settings, 2, [], classrooms, now).period.hasStarted,
    ).toBe(false);
  });
});
