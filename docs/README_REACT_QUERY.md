# React Query + Query Keys Setup ✅

## 🎯 สถานะการทำงาน: **COMPLETE**

โปรเจคนี้ใช้ **React Query v5** พร้อม **Centralized Query Keys Configuration** แล้ว!

---

## 📂 โครงสร้างไฟล์

```
frontend/
├── src/
│   ├── app/
│   │   └── providers.tsx               ✅ QueryClientProvider setup
│   ├── hooks/
│   │   ├── queries/
│   │   │   ├── useStatistics.ts        ✅ Statistics hooks
│   │   │   ├── useStudents.ts          ✅ Students hooks (6 hooks)
│   │   │   ├── useDepartments.ts       ✅ Departments & Programs hooks
│   │   │   ├── useUserProjects.ts      ✅ User projects hooks
│   │   │   └── index.ts                ✅ Exports
│   │   └── useQueryImage.tsx           ✅ Image query hook (updated v5)
│   └── libs/
│       └── react-query/
│           ├── queryKeys.ts            ✅ Query keys config (14 entities)
│           └── index.ts                ✅ Exports
└── package.json                        ✅ DevTools installed
```

---

## 🚀 Quick Start

### 1. Import Hooks

```typescript
import { useStudents, useStudent, useUpdateStudent } from '@/hooks/queries';
```

### 2. Use in Component

```typescript
const StudentList = () => {
  const { data: students, isLoading, error } = useStudents({ classroomId: '123' });

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return <DataGrid rows={students} />;
};
```

### 3. Mutations

```typescript
const { mutate: updateStudent, isPending } = useUpdateStudent();

updateStudent({ studentId: '123', params: data }, {
  onSuccess: () => toast.success('Success'),
  onError: () => toast.error('Error'),
});
```

---

## 🔑 Query Keys

**Import:**
```typescript
import { queryKeys } from '@/libs/react-query/queryKeys';
```

**Available:**
```typescript
queryKeys.students.all              // ['students']
queryKeys.students.list(filters)    // ['students', 'list', { ... }]
queryKeys.students.detail(id)       // ['students', 'detail', 'id']
queryKeys.statistics.term(params)   // ['statistics', 'term', { ... }]
queryKeys.departments.all           // ['departments']
queryKeys.programs.all              // ['programs']
```

---

## 🛠️ DevTools

**วิธีเปิด:**
1. `bun run dev`
2. กด React Query logo (มุมล่างซ้าย)

**Features:**
- ดู query status
- ตรวจสอบ cache
- Refetch manually
- Clear cache

---

## 📚 Available Hooks

### Students (6 hooks)
- `useStudents(params)` - List students
- `useStudentsSearch(params)` - Search students
- `useStudent(id)` - Get student detail
- `useUpdateStudent()` - Update student
- `useCreateStudent()` - Create student
- `useDeleteStudent()` - Delete student
- `useStudentTrophyOverview(id)` - Trophy overview

### Statistics
- `useTermStatistics(params)` - Term statistics

### Departments & Programs
- `useDepartments()` - All departments
- `usePrograms()` - All programs

### User Projects
- `useUserProjects(query)` - User projects list

---

## 📖 Documentation

- **README_API_CALLS.md** - Quick reference guide
- **QUERY_KEYS_GUIDE.md** - Complete query keys reference
- **REACT_QUERY_MIGRATION.md** - Setup & migration guide
- **COMPLETE_API_MIGRATION.md** - Full summary

---

## ✅ Checklist

### Setup
- [x] QueryClientProvider installed
- [x] DevTools installed
- [x] Query keys configured

### Hooks Created
- [x] Statistics hooks
- [x] Students hooks (6 hooks)
- [x] Departments & Programs hooks
- [x] User Projects hooks
- [x] Image query hook

### Components Migrated
- [x] TermStatisticsPage
- [x] UsersProjectListTable
- [x] useQueryImage

### Documentation
- [x] README_API_CALLS.md
- [x] QUERY_KEYS_GUIDE.md
- [x] REACT_QUERY_MIGRATION.md
- [x] COMPLETE_API_MIGRATION.md

---

## 🎉 **All Set!**

React Query พร้อมใช้งาน! 🚀
