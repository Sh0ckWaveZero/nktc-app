# Phase 7: React Query Migration Completion

## Overview
Phase 7 completes the React Query migration for NKTC Student Management System. All remaining domains now have dedicated React Query hooks, replacing Zustand store direct API calls.

## What's New

### 1. New Query Hook Files (5 files)

#### **useTeachers.ts** - Teacher Management
- `useTeachers()` - Fetch teachers list with filters
- `useTeachersSearch()` - Search teachers
- `useTeacher(teacherId)` - Get single teacher
- `useTeacherStudents(teacherId)` - Fetch students by teacher
- `useTeacherClassrooms(teacherId)` - Fetch classrooms by teacher
- `useCreateTeacher()` - Create new teacher
- `useUpdateTeacher()` - Update teacher
- `useUpdateTeacherProfile()` - Update teacher profile
- `useUpdateTeacherClassrooms()` - Update teacher classrooms
- `useDeleteTeacher()` - Delete teacher

#### **useGoodness.ts** - Good Behavior Records
- `useGoodnessRecords()` - Fetch all goodness records
- `useGoodnessSearch()` - Search goodness records
- `useStudentGoodnessRecords()` - Get records for specific student
- `useGoodnessSummary()` - Get goodness summary stats
- `useCreateGoodnessRecord()` - Create single record
- `useCreateGoodnessGroup()` - Create batch records
- `useDeleteGoodnessRecord()` - Delete record

#### **useBadness.ts** - Bad Behavior Records
- `useBadnessRecords()` - Fetch all badness records
- `useBadnessSearch()` - Search badness records
- `useStudentBadnessRecords()` - Get records for specific student
- `useBadnessSummary()` - Get badness summary stats
- `useCreateBadnessRecord()` - Create single record
- `useCreateBadnessGroup()` - Create batch records
- `useDeleteBadnessRecord()` - Delete record

#### **useVisits.ts** - Home Visit Records
- `useVisits()` - Fetch all visits
- `useVisitSearch()` - Search visits
- `useVisit()` - Get single visit
- `useStudentVisits()` - Get visits for specific student
- `useCreateVisit()` - Create visit record
- `useUpdateVisit()` - Update visit
- `useDeleteVisit()` - Delete visit

#### **useReports.ts** - Comprehensive Reporting
- `useCheckInSummaryReport()` - Check-in summary
- `useActivityCheckInSummaryReport()` - Activity check-in summary
- `useGoodnessReport()` - Goodness behavior report
- `useBadnessReport()` - Badness behavior report
- `useStudentSummaryReport()` - Student comprehensive summary
- `useExportReportPDF()` - Export to PDF
- `useExportReportExcel()` - Export to Excel
- `useAttendanceStatistics()` - Attendance stats
- `useBehaviorStatistics()` - Behavior stats

### 2. Migrated Legacy Hooks

#### **useFetchClassrooms.tsx**
- ✅ Migrated to use `useClassrooms()` from React Query
- Maintains backward compatibility via wrapper
- Removed direct Zustand store dependency

#### **useStudentList.tsx**
- ✅ Migrated to use `useStudentsSearch()` from React Query
- Removed direct Zustand store dependency
- Automatic query-based search

#### **useGetPDF.tsx**
- ✅ Migrated to use React Query `useQuery()`
- Better caching (30-minute staleTime)
- Improved error handling

### 3. Updated Index Exports
- `src/hooks/queries/index.ts` updated with all new exports
- All hooks now available via `@/hooks/queries`

### 4. Test Coverage
Created comprehensive unit tests:
- `__tests__/useTeachers.spec.ts` - 6 test cases
- `__tests__/useGoodness.spec.ts` - 5 test cases
- `__tests__/useBadness.spec.ts` - 5 test cases
- `__tests__/useVisits.spec.ts` - 6 test cases
- `__tests__/useReports.spec.ts` - 8 test cases

## Migration Benefits

### ✅ Improved Performance
- Automatic caching with configurable staleTime
- Smart query invalidation
- Reduced unnecessary API calls

### ✅ Better Developer Experience
- Type-safe query responses
- Consistent error handling
- Easier to test and maintain
- Integrated with React DevTools

### ✅ Code Quality
- Eliminated direct Zustand API calls
- Consistent patterns across all domains
- Single source of truth for query keys
- Proper separation of concerns

### ✅ Scalability
- Easy to add new queries
- Reusable query patterns
- Better memory management
- Automatic cleanup

## Usage Examples

### Fetching Data
```typescript
// Teachers
const { data: teachers, isLoading } = useTeachers();
const { data: teacher } = useTeacher('teacherId');
const { data: students } = useTeacherStudents('teacherId');

// Goodness Records
const { data: records } = useGoodnessRecords();
const { data: summary } = useGoodnessSummary({ classroomId: 'C1' });

// Badness Records
const { data: records } = useBadnessRecords();
const { data: studentRecords } = useStudentBadnessRecords('studentId');

// Visits
const { data: visits } = useVisits();
const { data: visit } = useVisit('visitId');

// Reports
const { data: report } = useCheckInSummaryReport({ classroomId: 'C1' });
const { data: studentSummary } = useStudentSummaryReport('studentId');
```

### Creating/Updating Data
```typescript
// Create teacher
const { mutate: createTeacher } = useCreateTeacher();
createTeacher({ firstName: 'John', lastName: 'Doe' });

// Create goodness record
const { mutate: createRecord } = useCreateGoodnessRecord();
createRecord({ studentId: 'S1', goodDate: new Date() });

// Delete record
const { mutate: deleteRecord } = useDeleteGoodnessRecord();
deleteRecord('recordId');

// Export report
const { mutate: exportPDF } = useExportReportPDF();
exportPDF({ classroomId: 'C1' });
```

## Configuration

### Query Key Patterns
All queries use centralized query keys defined in `queryKeys.ts`:
```typescript
// Teachers
queryKeys.teachers.all               // All teacher queries
queryKeys.teachers.list(params)      // List with filters
queryKeys.teachers.detail(id)        // Single teacher
queryKeys.teachers.students(id)      // Teacher's students
queryKeys.teachers.classrooms(id)    // Teacher's classrooms

// Goodness
queryKeys.goodness.all               // All goodness queries
queryKeys.goodness.list(params)      // List with filters
queryKeys.goodness.student(id)       // Student's records

// Similar patterns for badness, visits, etc.
```

### Cache Configuration
- **Goodness/Badness Records**: 5 min staleTime
- **Teachers/Classrooms**: 5 min staleTime
- **Visits**: 5 min staleTime
- **Reports**: 5 min staleTime
- **Search Queries**: 2 min staleTime
- **PDFs**: 30 min staleTime

## Breaking Changes

### ⚠️ For Components Using Old Stores

#### Before (Zustand):
```typescript
import { useTeacherStore } from '@/store';

const { teacher, fetchTeacher } = useTeacherStore();
await fetchTeacher({ q: 'search' });
```

#### After (React Query):
```typescript
import { useTeachers } from '@/hooks/queries';

const { data: teacher } = useTeachers({ q: 'search' });
```

## Migration Checklist

- ✅ Create useTeachers.ts with 9 hooks
- ✅ Create useGoodness.ts with 7 hooks
- ✅ Create useBadness.ts with 7 hooks
- ✅ Create useVisits.ts with 7 hooks
- ✅ Create useReports.ts with 10 hooks
- ✅ Migrate useFetchClassrooms.tsx
- ✅ Migrate useStudentList.tsx
- ✅ Migrate useGetPDF.tsx
- ✅ Update queries/index.ts exports
- ✅ Write comprehensive unit tests (25 test cases)
- ✅ Phase 7 documentation

## Testing

Run tests to verify migrations:
```bash
# Run all tests
npm run test

# Run specific hook tests
npm run test -- useTeachers.spec
npm run test -- useGoodness.spec
npm run test -- useBadness.spec
npm run test -- useVisits.spec
npm run test -- useReports.spec
```

## Next Steps

1. **Run the test suite** - Ensure all new hooks work correctly
2. **Update components** - Replace old store/hook usage with new React Query hooks
3. **Remove old stores** - Once components are updated, remove Zustand stores
4. **Monitor performance** - Use React Query DevTools to verify caching behavior

## References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Query Key Factory Pattern](https://tanstack.com/query/latest/docs/react/community/tkdp)
- [Mutations Guide](https://tanstack.com/query/latest/docs/react/guides/mutations)

## Support

For questions or issues with the new hooks:
1. Check the hook implementation in `src/hooks/queries/`
2. Review test cases in `__tests__/`
3. Refer to similar hooks like `useStudents.ts` for patterns
