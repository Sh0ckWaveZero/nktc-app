import { Prisma } from "../../generated/client";
import { AppError } from "./errors";
import { getAcademicYearContext } from "./academic-year-context";

const YEAR_MODELS = new Set([
  "ReportCheckIn", "ActivityCheckInReport", "GoodnessIndividual",
  "BadnessIndividual", "VisitStudent", "AcademicCalendarEvent",
]);
const YEAR_RELATIONS = new Set([
  "reportCheckIn", "activityCheckInReport", "goodnessIndividual",
  "badnessIndividual", "VisitStudent", "attendance", "activities",
  "goodness", "badness", "visits", "events",
]);
const WRITE_OPERATIONS = new Set([
  "create", "createMany", "createManyAndReturn", "update", "updateMany",
  "updateManyAndReturn", "upsert", "delete", "deleteMany",
]);
type Arguments = Record<string, unknown>;

const isObject = (value: unknown): value is Arguments =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cloneSelection = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(cloneSelection);
  if (!isObject(value) || Object.getPrototypeOf(value) !== Object.prototype) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneSelection(entry)]));
};

const filterRelations = (selection: unknown, academicYear: number): void => {
  if (!isObject(selection)) return;
  for (const [key, value] of Object.entries(selection)) {
    // Master-data dependency counts intentionally include archived records.
    if (key === "_count") continue;
    if (YEAR_RELATIONS.has(key) && (value === true || isObject(value))) {
      const relation: Arguments = value === true ? {} : value;
      relation.where = { ...(isObject(relation.where) ? relation.where : {}), academicYearId: academicYear };
      selection[key] = relation;
    }
    const relation = selection[key];
    if (isObject(relation)) {
      filterRelations(relation.include, academicYear);
      filterRelations(relation.select, academicYear);
    }
  }
};

const tagData = (value: unknown, academicYear: number, isVisit: boolean): unknown => {
  if (Array.isArray(value)) {
    return value.map((item: unknown) => tagData(item, academicYear, isVisit));
  }
  if (!isObject(value)) return value;
  const data: Arguments = { ...value };
  const hasRelations = ["student", "teacher", "classroom"].some((key) => isObject(data[key]));
  if (hasRelations) {
    delete data.academicYearId;
    data[isVisit ? "year" : "academicYear"] = { connect: { academicYear } };
  } else {
    delete data[isVisit ? "year" : "academicYear"];
    data.academicYearId = academicYear;
  }
  if (isVisit) data.academicYear = String(academicYear);
  return data;
};

/** บังคับ Scope ทั้ง read, aggregate และ write ของบันทึกประจำปี */
export const academicYearExtension = Prisma.defineExtension({
  name: "academic-year-scope",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const context = getAcademicYearContext();
        if (!context) return query(args);
        const scoped = args as unknown as Arguments;
        if (YEAR_MODELS.has(model)) {
          const isWrite = WRITE_OPERATIONS.has(operation);
          if (isWrite && context.academicYear !== context.activeAcademicYear) {
            throw new AppError("ปีการศึกษาเดิมเปิดดูได้อย่างเดียว กรุณากลับปีที่ใช้งานก่อนบันทึก", 409, "ACADEMIC_YEAR_READ_ONLY");
          }
          if (isWrite && context.version > 1 && context.expectedVersion !== context.version) {
            throw new AppError("ปีการศึกษาที่ใช้งานเปลี่ยนแล้ว กรุณาโหลดข้อมูลใหม่ก่อนบันทึก", 409, "ACADEMIC_YEAR_CHANGED");
          }
          if (!operation.startsWith("create")) {
            const where = isObject(scoped.where) ? scoped.where : {};
            // An explicit year is used only by server-owned historical reports.
            scoped.where = { ...where, academicYearId: isWrite ? context.academicYear : (where.academicYearId ?? context.academicYear) };
          }
          if (isWrite) {
            if (operation.startsWith("create")) scoped.data = tagData(scoped.data, context.academicYear, model === "VisitStudent");
            if (operation === "upsert") scoped.create = tagData(scoped.create, context.academicYear, model === "VisitStudent");
            // An update can never move a record between years.
            for (const field of (operation.startsWith("update") ? ["data"] : operation === "upsert" ? ["update"] : [])) {
              if (isObject(scoped[field])) {
                scoped[field] = { ...scoped[field] };
                if (!isObject(scoped[field])) continue;
                delete scoped[field].academicYearId;
                delete scoped[field][model === "VisitStudent" ? "year" : "academicYear"];
                if (model === "VisitStudent") scoped[field].academicYear = String(context.academicYear);
              }
            }
          }
        }
        if (scoped.include) scoped.include = cloneSelection(scoped.include);
        if (scoped.select) scoped.select = cloneSelection(scoped.select);
        filterRelations(scoped.include, context.academicYear);
        filterRelations(scoped.select, context.academicYear);
        return query(args);
      },
    },
  },
});
