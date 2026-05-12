# Changelog

## [Unreleased]

### Features
- **Student promotion**: add `promote-preview` and `promote` endpoints for moving students between classrooms; add `usePromotePreview` / `usePromoteStudents` React Query hooks
- **Student creation**: add duplicate `studentId` / username conflict detection with `ConflictError`; wrap full create flow in Prisma transaction
- **Teacher import**: validate role before upsert (reject non-Teacher username conflicts); add transaction-based account upsert for existing users

### Bug Fixes
- Fix student delete endpoint URL (`/profile/:id` → `/:id`)
- Fix student create endpoint URL (trailing slash)
- Remove `importTeachersFromXLSX` duplicate from `xlsx.ts` (logic moved to service layer)

### Code Quality
- Add `<Suspense>` boundary around `StudentListPage` to satisfy `useSearchParams` requirement
- Add `role="button"` + `onKeyDown` to clickable div in `TimelineGoodness` (a11y)
- Add `suppressHydrationWarning` to date-formatted `Typography` nodes
- Use lazy state initializer `() => ThailandAddressValueHelper.empty()` in `StudentAddPage`
- Destructure `push` / `back` from `useRouter()` in `StudentAddPage` / `StudentEditPage`
- React Doctor score: 93 → 95
