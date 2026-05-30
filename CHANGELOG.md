# Changelog

## [1.0.5] - 2026-05-30

### หัวข้อ

- ปรับรายงานเช็คชื่อกิจกรรมให้เหลือ 3 ประเภท เพิ่มระบบหมายเหตุ และเพิ่มตัวกรอง/ส่งออกข้อมูลสำหรับผู้ดูแลระบบ

### รายละเอียดการแก้ไข

- **ระบบเช็คชื่อกิจกรรมหลัก (Activity Check-In)**:
  - `apps/reports/activity-check-in/` ถอดประเภทกิจกรรม `รด.` ออกจากเมนูเลือกกิจกรรม เหลือ 3 ประเภทคือ ชมรมวิชาชีพ, อวท. และลูกเสือ
  - `apps/reports/activity-check-in/` เพิ่มช่องกรอก `หมายเหตุ` ในหน้าเช็คชื่อกิจกรรม และโหลดหมายเหตุเดิมกลับมาเมื่อเปิดข้อมูลย้อนหลังของวันนั้น
- **ระบบรายงานเช็คชื่อกิจกรรมของครู**:
  - `apps/reports/activity-check-in/daily/` และ `apps/reports/check-in/daily/` แสดง `หมายเหตุ` ที่บันทึกไว้บนหน้ารายงานรายวัน
  - `apps/reports/activity-check-in/summary/` และส่วนพิมพ์รายงาน ถอด `รด.` ออกจากตัวเลือกประเภทกิจกรรมและ label ที่เกี่ยวข้องทั้งหมด
- **ระบบรายงานเช็คชื่อกิจกรรมของผู้ดูแลระบบ**:
  - `apps/admin/reports/activity-check-in/daily/`, `weekly/`, `monthly/` เพิ่ม Dropdown สำหรับเลือกประเภทกิจกรรม
  - ปุ่มดาวน์โหลดรายงานของหน้า admin รองรับการ Export ตามประเภทกิจกรรมที่เลือกจริง
  - ตารางรายงานของ admin แสดง `หมายเหตุรายวัน` แบบละเอียดรายห้องในช่วงวันที่เลือก แทนการแสดงเฉพาะหมายเหตุล่าสุด
  - ไฟล์ Export Excel เพิ่มชีตสรุปและชีต `หมายเหตุรายวัน` เพื่อให้ตรวจสอบหมายเหตุย้อนหลังได้ครบ
- **ระบบ Elysia Backend & Database (PostgreSQL)**:
  - `backend-elysia` ปรับ admin activity report endpoint ให้รองรับการกรองตาม `activityType` ในรายงานรายวัน, รายสัปดาห์ และรายเดือน
  - `ActivityCheckInService.getByDateRange()` ปรับการรวมข้อมูลตามช่วงวันให้คำนวณตามประเภทกิจกรรมที่เลือก และส่ง `noteEntries` กลับไปใช้แสดงผล/ส่งออกบนหน้า admin
- **UI Fixes**:
  - แก้ warning `React does not recognize the disableMargin prop on a DOM element` ในตัวเลือกสัปดาห์ของรายงาน admin โดยลบ prop ที่ไม่รองรับออกจาก custom picker day

## [1.0.4] - 2026-05-22

### หัวข้อ

- เพิ่มระบบสลับประเภทกิจกรรม, โหลดความเร็วสูง และบันทึก/เลือกวันที่เช็คชื่อกิจกรรมย้อนหลัง

### รายละเอียดการแก้ไข

- **ระบบเช็คชื่อกิจกรรมหลัก (Activity Check-In)**:
  - `apps/reports/activity-check-in/` เพิ่มตัวเลือกสลับประเภทกิจกรรม 4 ประเภท (ชมรมวิชาชีพ, อวท., ลูกเสือ, รด.) ด้วยเมนู Dropdown
  - `apps/reports/activity-check-in/` เพิ่มตัวเลือกวันที่ย้อนหลังผ่าน `ThaiDatePicker` (พ.ศ.) ดึงข้อมูลประวัติเก่าและบันทึกข้อมูลย้อนหลังเข้าฐานข้อมูลตามวันที่เลือกจริง
  - ปรับปรุงประสิทธิภาพป้องกันการกะพริบสะดุดของหน้าจอ (UI Jitter Fix) โดยใช้ `keepPreviousData` ของ React Query เพื่อแสดงข้อมูลเดิมไว้ระหว่างสลับโหลดข้อมูลใหม่
  - ล็อกโครงสร้างแผงควบคุม `<CheckInControls />` ไม่ให้หายไประหว่างดึงข้อมูล ป้องกันปัญหา Layout Shift บนหน้าจอมือถือ
- **ระบบรายงานเช็คชื่อกิจกรรมรายวันย้อนหลัง**:
  - `apps/reports/activity-check-in/daily/` ปรับเปลี่ยนเป็น **"รายงานการเช็คชื่อหน้าเสาธง"** โดยฟิกซ์ประเภทกิจกรรมเป็น CLUB และถอดเมนูเลือกประเภทกิจกรรมออกเพื่อป้องกันการสับสน
  - `apps/reports/check-in/daily/` ปรับปรุงหน้ารายงานประจำวันทั่วไปใหม่หมดจดให้สวยงามและมีความสามารถเทียบเท่าหน้ารายงานกิจกรรม (แสดงวันที่, มีตัวเลือกประเภทกิจกรรม, แสดง Chip สถานะการเช็คชื่อ และปุ่มกดแก้ไข/ลบย้อนหลัง)
- **ระบบ Elysia Backend & Database (PostgreSQL)**:
  - `schema.prisma` เพิ่มฟิลด์ `activityType` ใน `ActivityCheckInReport` เพื่อแยกการจัดเก็บข้อมูลทั้ง 4 กิจกรรมในวันเดียวกันได้โดยไม่ชนกัน
  - สร้าง Composite Indices บน `ActivityCheckInReport` เพื่อเพิ่มความเร็วในการดึงข้อมูลย้อนหลังและรายงานสรุป
  - อัปเดต API Endpoints, Model schema, และ Service layer ใน `backend-elysia` ให้รับส่งและตรวจสอบ Conflict ร่วมกับ `activityType` และ `checkInDate` ย้อนหลัง

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
- Teacher visit list (`/apps/visit/list`) and SDQ assessment page (`/apps/visit/sdq`) no longer lose advisor classroom scope when `auth.user.teacherOnClassroom` is partial or missing; both now fall back to teacher classroom relations and teacher-scoped visit rows
- Teacher home dashboard now computes visit / SDQ progress from the actual teacher-scoped visit population when advisor classroom payloads are incomplete, preventing missing student counts and incorrect progress cards
- Admin visit report (`/apps/admin/reports/visit`) now aggregates saved student counts by advisor scope correctly and shows the latest saved date per teacher instead of the backdated home-visit date

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
- Resolve outstanding frontend TypeScript errors across ACL guards, Thailand address typings, program delete dialog imports, query/store endpoint typings, and visit hook test payloads so `frontend` `tsc --noEmit` passes again
- Switch frontend Vitest execution on Windows/Bun to `bun ./node_modules/vitest/vitest.mjs` with `pool: 'forks'`, avoiding the `bunx` / shim startup failures and restoring focused test runs
