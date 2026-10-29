import type { AttendanceSummary } from "./types";

const DAYS_PER_WEEK: number = 7;
const ACADEMIC_WEEKS: number = 18;
const DAY_MS: number = 86_400_000;
const STATUS_KEYS = [
  "present",
  "absent",
  "late",
  "leave",
  "internship",
] as const;
const thaiDayFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
type AttendanceStatus = (typeof STATUS_KEYS)[number];
type Counts = AttendanceSummary["totals"];

export interface CalendarYear {
  academicYear: number;
  term1Start: Date;
  term2Start: Date;
  term1Name: string;
  term2Name: string;
  startWeekOnMonday: boolean;
}

export interface AttendanceRecord {
  id: string;
  classroomId: string;
  classroomKey: string | null;
  checkInDate: Date | null;
  updatedAt: Date;
  present: string[];
  absent: string[];
  late: string[];
  leave: string[];
  internship: string[];
}

export interface AttendanceClassroom {
  id: string;
  classroomId: string | null;
  name: string | null;
  department: { id: string; name: string | null } | null;
  level: { levelName: string | null } | null;
}

interface GroupAccumulator {
  counts: Counts;
  students: Set<string>;
  days: Set<string>;
  classrooms: Set<string>;
}

interface Observation {
  studentId: string;
  date: string;
  status: AttendanceStatus | null;
  reportId: string;
  classroomId: string;
}

const dateKey = (date: Date): string => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * DAY_MS);
const emptyCounts = (): Counts => ({
  present: 0,
  absent: 0,
  late: 0,
  leave: 0,
  internship: 0,
  total: 0,
  punctualityRate: null,
});
const createGroup = (): GroupAccumulator => ({
  counts: emptyCounts(),
  students: new Set(),
  days: new Set(),
  classrooms: new Set(),
});
const addObservation = (
  group: GroupAccumulator,
  observation: Observation,
  status: AttendanceStatus,
): void => {
  group.counts[status] += 1;
  group.counts.total += 1;
  group.students.add(observation.studentId);
  group.days.add(observation.date);
  group.classrooms.add(observation.classroomId);
};
const finishGroup = (
  group: GroupAccumulator,
): Counts & { uniqueStudents: number; recordedDays: number } => {
  const eligible: number =
    group.counts.present + group.counts.absent + group.counts.late;
  return {
    ...group.counts,
    punctualityRate: eligible
      ? Math.round((group.counts.present / eligible) * 10_000) / 100
      : null,
    uniqueStudents: group.students.size,
    recordedDays: group.days.size,
  };
};

/** คำนวณ Period และ AcademicWeek ตามวันเปิดเทอมและรอบสัปดาห์ของปฏิทิน */
export const getAttendanceTermPeriod = (
  settings: CalendarYear,
  term: 1 | 2,
  now: Date = new Date(),
) => {
  const startDate: string = dateKey(
    term === 1 ? settings.term1Start : settings.term2Start,
  );
  const start: Date = new Date(`${startDate}T00:00:00.000Z`);
  const mondayOffset: number =
    (start.getUTCDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
  const anchor: Date = settings.startWeekOnMonday
    ? addDays(start, -mondayOffset)
    : start;
  const defaultEnd: Date = addDays(anchor, ACADEMIC_WEEKS * DAYS_PER_WEEK - 1);
  const nextTerm: Date = new Date(
    `${dateKey(settings.term2Start)}T00:00:00.000Z`,
  );
  const end: Date =
    term === 1 && nextTerm <= defaultEnd ? addDays(nextTerm, -1) : defaultEnd;
  const endDate: string = dateKey(end);
  const today: string = thaiDayFormatter.format(now);
  const throughDate: string = today < endDate ? today : endDate;
  const weeks: { week: number; startDate: string; endDate: string }[] = [];
  for (let index: number = 0; index < ACADEMIC_WEEKS; index += 1) {
    const weekStart: Date =
      index === 0 ? start : addDays(anchor, index * DAYS_PER_WEEK);
    if (weekStart > end) break;
    const weekEnd: Date = addDays(
      anchor,
      index * DAYS_PER_WEEK + DAYS_PER_WEEK - 1,
    );
    weeks.push({
      week: index + 1,
      startDate: dateKey(weekStart),
      endDate: dateKey(weekEnd < end ? weekEnd : end),
    });
  }
  return {
    period: {
      academicYear: settings.academicYear,
      term,
      name: term === 1 ? settings.term1Name : settings.term2Name,
      startDate,
      endDate,
      throughDate,
      hasStarted: throughDate >= startDate,
    },
    weeks,
  };
};

/** สรุป Student-day โดยใช้สถานะจากรายการล่าสุดและแยกข้อมูลซ้ำออกจากยอดจริง */
export const summarizeAttendance = (
  settings: CalendarYear,
  term: 1 | 2,
  records: readonly AttendanceRecord[],
  classrooms: readonly AttendanceClassroom[],
  now: Date = new Date(),
): AttendanceSummary => {
  const { period, weeks } = getAttendanceTermPeriod(settings, term, now);
  const classroomMap: Map<string, AttendanceClassroom> = new Map();
  for (const classroom of classrooms) {
    classroomMap.set(classroom.id, classroom);
    if (classroom.classroomId)
      classroomMap.set(classroom.classroomId, classroom);
  }
  const quality: AttendanceSummary["quality"] = {
    sourceReports: 0,
    duplicateEntries: 0,
    conflictingStudentDays: 0,
    invalidEntries: 0,
  };
  const observations: Map<string, Observation> = new Map();
  const sorted: AttendanceRecord[] = [...records].sort(
    (left: AttendanceRecord, right: AttendanceRecord): number =>
      right.updatedAt.getTime() - left.updatedAt.getTime() ||
      right.id.localeCompare(left.id),
  );
  for (const record of sorted) {
    if (!record.checkInDate) continue;
    const date: string = thaiDayFormatter.format(record.checkInDate);
    if (
      date < period.startDate ||
      date > period.throughDate ||
      !period.hasStarted
    )
      continue;
    quality.sourceReports += 1;
    const classroom: AttendanceClassroom | undefined =
      classroomMap.get(record.classroomKey ?? "") ??
      classroomMap.get(record.classroomId);
    const classroomId: string =
      classroom?.id ?? record.classroomKey ?? record.classroomId;
    for (const status of STATUS_KEYS) {
      for (const rawId of record[status]) {
        const studentId: string = rawId.trim();
        if (!studentId) {
          quality.invalidEntries += 1;
          continue;
        }
        const key: string = `${date}:${studentId}`;
        const previous: Observation | undefined = observations.get(key);
        if (!previous) {
          observations.set(key, {
            studentId,
            date,
            status,
            reportId: record.id,
            classroomId,
          });
          continue;
        }
        quality.duplicateEntries += 1;
        if (
          previous.reportId === record.id &&
          previous.status !== null &&
          previous.status !== status
        ) {
          previous.status = null;
          quality.conflictingStudentDays += 1;
        }
      }
    }
  }
  const total: GroupAccumulator = createGroup();
  const weeklyGroups: GroupAccumulator[] = weeks.map(
    (): GroupAccumulator => createGroup(),
  );
  const classroomGroups: Map<string, GroupAccumulator> = new Map();
  const departmentGroups: Map<string, GroupAccumulator & { name: string }> =
    new Map();
  for (const observation of observations.values()) {
    if (!observation.status) continue;
    const classroom: AttendanceClassroom | undefined = classroomMap.get(
      observation.classroomId,
    );
    const departmentId: string = classroom?.department?.id ?? "unassigned";
    const department: GroupAccumulator & { name: string } =
      departmentGroups.get(departmentId) ?? {
        ...createGroup(),
        name: classroom?.department?.name ?? "ไม่ระบุแผนก",
      };
    const room: GroupAccumulator =
      classroomGroups.get(observation.classroomId) ?? createGroup();
    addObservation(total, observation, observation.status);
    addObservation(room, observation, observation.status);
    addObservation(department, observation, observation.status);
    classroomGroups.set(observation.classroomId, room);
    departmentGroups.set(departmentId, department);
    const weekIndex: number = weeks.findIndex(
      (week): boolean =>
        observation.date >= week.startDate && observation.date <= week.endDate,
    );
    if (weekIndex >= 0)
      addObservation(weeklyGroups[weekIndex], observation, observation.status);
  }
  const result: ReturnType<typeof finishGroup> = finishGroup(total);
  return {
    period,
    totals: {
      present: result.present,
      absent: result.absent,
      late: result.late,
      leave: result.leave,
      internship: result.internship,
      total: result.total,
      punctualityRate: result.punctualityRate,
    },
    uniqueStudents: result.uniqueStudents,
    recordedDays: result.recordedDays,
    classroomsCount: classroomGroups.size,
    weekly: weeks.map((week, index: number) => ({
      ...week,
      ...finishGroup(weeklyGroups[index]),
    })),
    departments: [...departmentGroups]
      .map(([id, group]) => ({
        id,
        name: group.name,
        classroomsCount: group.classrooms.size,
        ...finishGroup(group),
      }))
      .sort((left, right): number => left.name.localeCompare(right.name, "th")),
    classrooms: [...classroomGroups]
      .map(([id, group]) => {
        const classroom: AttendanceClassroom | undefined = classroomMap.get(id);
        return {
          id,
          name: classroom?.name ?? "ไม่พบชื่อห้องเรียน",
          departmentName: classroom?.department?.name ?? "ไม่ระบุแผนก",
          levelName: classroom?.level?.levelName ?? "ไม่ระบุระดับชั้น",
          ...finishGroup(group),
        };
      })
      .sort(
        (left, right): number =>
          left.departmentName.localeCompare(right.departmentName, "th") ||
          left.name.localeCompare(right.name, "th", { numeric: true }),
      ),
    quality,
    generatedAt: now.toISOString(),
  };
};
