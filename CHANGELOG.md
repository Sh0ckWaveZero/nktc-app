# Changelog

## [1.0.3] - 2026-05-21

### หัวข้อ

- เพิ่มการเลือกวันที่ย้อนหลังในหน้าเช็คชื่อหน้าเสาธง

### รายละเอียดการแก้ไข

- `apps/reports/check-in/` เพิ่มตัวเลือกวันที่เช็คชื่อไว้ข้างตัวเลือกห้องเรียน
- ปรับการโหลดสถานะการเช็คชื่อและการบันทึกให้ใช้วันที่ที่ครูเลือก แทนการยึดเฉพาะวันที่ปัจจุบัน
- ปรับวันที่ที่แสดงบนหัวหน้าเช็คชื่อให้เปลี่ยนตามวันที่ที่เลือก

## [1.0.2] - 2026-05-21

### หัวข้อ

- ปรับปรุงการเรียงรหัสนักเรียนในหน้ารายงานเช็คชื่อของครู

### รายละเอียดการแก้ไข

- `apps/reports/check-in/` เรียงรายชื่อนักเรียนตาม `studentId` แบบ numeric-aware ก่อนแสดงผล
- `apps/reports/activity-check-in/` เรียงรายชื่อนักเรียนตาม `studentId` ทั้งตอนโหลดห้องแรกและตอนเปลี่ยนห้องเรียน
- แก้การบันทึกเช็คชื่อกิจกรรมให้ไม่นับนักเรียนสถานะฝึกงานเป็นรายการที่ต้องเช็ค เนื่องจากแถวนักเรียนฝึกงานถูก disable อยู่แล้ว
- แก้ปุ่มเลือกทั้งหมดในหน้าเช็คชื่อกิจกรรมให้คำนวณเฉพาะนักเรียนที่สามารถเช็คชื่อได้
- แก้การเปลี่ยนห้องเรียนในหน้าเช็คชื่อกิจกรรมให้ล้าง state เก่า และให้ query โหลดข้อมูลตามห้องเรียนที่เลือกใหม่
- แก้กรณีข้อมูลห้องเรียนของครูว่าง ให้ล้างข้อมูลห้องเรียน/นักเรียนเดิมออกจากหน้าจอ

## [Unreleased] — feature/classroom-student-management

### Added

- **Student view page** — full redesign with real API data; 2-column layout, tabbed panels (overview / goodness / badness), back button, trophy score display, and tab count badges
- **Student detail card** — personal info and academic info sections with skeleton loading
- **Classroom promotion dialog** — promote all students from one classroom to another with conflict detection and preview
- **Student individual promotion dialog** — promote a single student to a target classroom
- **Student graduation dialogs** — per-student and bulk classroom graduation flows with graduation year/date inputs
- **Shared dialog components** — `ConfirmDialog`, `GenericDeleteDialog`, `GenericGraduationDialog` extracted to `@core/components/dialogs` for reuse
- **Delete dialog wrappers** — `ClassroomDeleteDialog`, `DepartmentDeleteDialog`, `ProgramDeleteDialog`, `StudentDeleteDialog`, `TeacherDeleteDialog` using shared generic components
- `useStudentClassroomTeachers` hook — fetches teachers for a student's classroom via dedicated backend endpoint
- `useGraduateClassroom` and `useGraduateStudent` query hooks
- Backend: `promote-classroom`, `graduate-classroom`, and `promote-preview` student endpoints (Elysia)

### Fixed

- Student list blank after navigating back from student view — query disabled until classroom ID initialised
- Trophy scores showing 0 — backend field names (`goodnessScore`/`badnessScore`/`goodnessCount`) normalised to component expectations (`goodScore`/`badScore`/`totalTrophy`) in `useStudentTrophyOverview`
- Hydration error: `<div>` inside `<p>` in `StudentDetailCard` — replaced `Typography` with `Box` in `DetailRow`
- Student edit cancel button (`#student-edit-cancel-btn`) now uses `router.push` with classroom param preserved instead of `router.back()` which caused blank page
- Student edit save success also navigates to correct list URL preserving classroom param
- `TimelineGoodness` was only rendering the first record — now maps all records
- Removed stale `@ts-expect-error` directives in `TimelineGoodness` and `TimelineBadness`
- Fix student delete endpoint URL (`/profile/:id` → `/:id`)
- Fix student create endpoint URL (trailing slash)
- Remove `importTeachersFromXLSX` duplicate from `xlsx.ts` (logic moved to service layer)

### Changed

- Delete dialogs for classroom, department, program, teacher, and student refactored to use shared `GenericDeleteDialog`
- `ClassroomSettingsPage` — promotion and graduation actions added to classroom row actions
- `StudentListPage` and `TableHeader` — individual promotion action available per student row; filter/action controls updated
- **Student promotion**: add `promote-preview` and `promote` endpoints for moving students between classrooms; add `usePromotePreview` / `usePromoteStudents` React Query hooks
- **Student creation**: add duplicate `studentId` / username conflict detection with `ConflictError`; wrap full create flow in Prisma transaction
- **Teacher import**: validate role before upsert; add transaction-based account upsert for existing users

### Code Quality

- Add `<Suspense>` boundary around `StudentListPage` to satisfy `useSearchParams` requirement
- Add `role="button"` + `onKeyDown` to clickable div in `TimelineGoodness` (a11y)
- Add `suppressHydrationWarning` to date-formatted `Typography` nodes
- Use lazy state initializer `() => ThailandAddressValueHelper.empty()` in `StudentAddPage`
