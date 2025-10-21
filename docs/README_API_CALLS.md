# 📖 API Calls Guide - Quick Reference

## 🎯 Decision Matrix: เลือกใช้แบบไหนดี?

```
┌─────────────────────────────────────────────────────────┐
│  ใช้ React Query Hooks เมื่อ:                         │
│  ✅ ดึงข้อมูลจาก API (GET)                             │
│  ✅ ต้องการ caching                                    │
│  ✅ ต้องการ auto-refetch                               │
│  ✅ มี loading/error states                            │
│  Examples: Students list, Statistics, Reports          │
├─────────────────────────────────────────────────────────┤
│  ใช้ Zustand เมื่อ:                                    │
│  ✅ จัดการ UI state                                     │
│  ✅ Theme, Settings, Modal states                      │
│  ✅ Navigation state                                    │
│  Examples: Theme toggle, Sidebar state                 │
├─────────────────────────────────────────────────────────┤
│  ใช้ apiService เมื่อ:                                 │
│  ✅ One-time actions                                    │
│  ✅ Upload file, Logout                                 │
│  ✅ Fire-and-forget operations                         │
│  Examples: Delete, Upload, Logout                      │
├─────────────────────────────────────────────────────────┤
│  ❌ ห้ามใช้:                                            │
│  ❌ axios โดยตรง                                        │
│  ❌ fetch โดยตรง                                        │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Examples

### 1. ดึงข้อมูล List (React Query)

```typescript
import { useStudents } from '@/hooks/queries';

const StudentListPage = () => {
  const { data: students, isLoading, error } = useStudents({ classroomId: '123' });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading data</Alert>;

  return <DataGrid rows={students} />;
};
```

---

### 2. ดึงข้อมูล Detail (React Query)

```typescript
import { useStudent } from '@/hooks/queries';

const StudentProfilePage = ({ studentId }: { studentId: string }) => {
  const { data: student, isLoading } = useStudent(studentId);

  if (isLoading) return <Loading />;

  return <StudentProfile data={student} />;
};
```

---

### 3. สร้าง/แก้ไขข้อมูล (React Query Mutation)

```typescript
import { useUpdateStudent } from '@/hooks/queries';
import toast from 'react-hot-toast';

const StudentForm = () => {
  const { mutate: updateStudent, isPending } = useUpdateStudent();

  const handleSubmit = (data) => {
    updateStudent(
      { studentId: '123', params: data },
      {
        onSuccess: () => toast.success('บันทึกสำเร็จ'),
        onError: () => toast.error('เกิดข้อผิดพลาด'),
      }
    );
  };

  return <Form onSubmit={handleSubmit} loading={isPending} />;
};
```

---

### 4. ลบข้อมูล (React Query Mutation)

```typescript
import { useDeleteStudent } from '@/hooks/queries';

const StudentActions = ({ studentId }: { studentId: string }) => {
  const { mutate: deleteStudent, isPending } = useDeleteStudent();

  const handleDelete = () => {
    if (confirm('ยืนยันการลบ?')) {
      deleteStudent(studentId, {
        onSuccess: () => toast.success('ลบสำเร็จ'),
      });
    }
  };

  return <Button onClick={handleDelete} disabled={isPending}>ลบ</Button>;
};
```

---

### 5. Search with Auto-refetch (React Query)

```typescript
import { useStudentsSearch } from '@/hooks/queries';
import { useState } from 'react';

const StudentSearch = () => {
  const [query, setQuery] = useState('');

  // Auto-refetch when query changes
  const { data: results, isLoading } = useStudentsSearch({ q: query });

  return (
    <>
      <TextField value={query} onChange={(e) => setQuery(e.target.value)} />
      {isLoading && <CircularProgress />}
      <SearchResults data={results} />
    </>
  );
};
```

---

## 📚 Available Hooks

### Students
```typescript
import {
  useStudents,        // List students
  useStudentsSearch,  // Search students
  useStudent,         // Get student detail
  useUpdateStudent,   // Update student (mutation)
  useCreateStudent,   // Create student (mutation)
  useDeleteStudent,   // Delete student (mutation)
  useStudentTrophyOverview, // Get trophy overview
} from '@/hooks/queries';
```

### Statistics
```typescript
import { useTermStatistics } from '@/hooks/queries';

const params = {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  departmentId: 'dept-123',
  programId: 'prog-456',
};

const { data: statistics } = useTermStatistics(params);
```

### Departments & Programs
```typescript
import { useDepartments, usePrograms } from '@/hooks/queries';

const { data: departments } = useDepartments();
const { data: programs } = usePrograms();
```

### User Projects
```typescript
import { useUserProjects } from '@/hooks/queries';

const { data: projects } = useUserProjects('search-query');
```

---

## 🔑 Query Keys Reference

```typescript
import { queryKeys } from '@/libs/react-query/queryKeys';

// Students
queryKeys.students.all              // ['students']
queryKeys.students.list(filters)    // ['students', 'list', { ... }]
queryKeys.students.detail(id)       // ['students', 'detail', 'id']

// Statistics
queryKeys.statistics.term(params)   // ['statistics', 'term', { ... }]

// Departments
queryKeys.departments.all           // ['departments']

// Programs
queryKeys.programs.all              // ['programs']
```

**การใช้งาน Invalidation:**

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/react-query/queryKeys';

const queryClient = useQueryClient();

// Invalidate specific student
queryClient.invalidateQueries({ queryKey: queryKeys.students.detail('123') });

// Invalidate all students
queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
```

---

## 🔧 React Query DevTools

### วิธีเปิด
1. Run `bun run dev`
2. เปิดเว็บไซต์
3. กด React Query logo (มุมล่างซ้าย)

### ใช้ทำอะไรได้?
- ✅ ดู query status (fresh, fetching, stale)
- ✅ ตรวจสอบ cache data
- ✅ Refetch queries manually
- ✅ Clear cache
- ✅ Debug performance issues

---

## 📝 Best Practices

### ✅ DO

```typescript
// ✅ ใช้ hooks จาก queries folder
import { useStudents } from '@/hooks/queries';

// ✅ ใช้ query keys จาก config
import { queryKeys } from '@/libs/react-query/queryKeys';
queryKey: queryKeys.students.list(filters)

// ✅ Handle loading & error states
if (isLoading) return <Loading />;
if (error) return <Error />;

// ✅ ใช้ mutations สำหรับ POST/PUT/DELETE
const { mutate, isPending } = useUpdateStudent();
```

---

### ❌ DON'T

```typescript
// ❌ อย่าใช้ axios โดยตรง
import axios from 'axios';
axios.get('/api/students'); // ❌ Wrong!

// ❌ อย่า hard-code query keys
queryKey: ['students', 'list'] // ❌ Wrong!

// ❌ อย่าใช้ Zustand สำหรับ server data
const useStudentStore = create((set) => ({ // ❌ Wrong!
  students: [],
  fetchStudents: async () => { ... }
}));

// ❌ อย่า manual state management
const [data, setData] = useState([]); // ❌ Wrong!
useEffect(() => {
  fetch('/api/students').then(...) // ❌ Wrong!
}, []);
```

---

## 🆘 Troubleshooting

### ปัญหา: Data ไม่ refresh
**วิธีแก้:**
```typescript
// 1. ลด staleTime
staleTime: 0 // Always refetch

// 2. Force refetch
const { refetch } = useStudents();
refetch();

// 3. Invalidate cache
queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
```

### ปัญหา: Mutation ไม่อัพเดท list
**วิธีแก้:**
```typescript
// Invalidate related queries
const { mutate } = useUpdateStudent();

mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
  },
});
```

### ปัญหา: TypeScript errors
**วิธีแก้:**
```typescript
// Import query keys
import { queryKeys } from '@/libs/react-query/queryKeys';

// ใช้ autocomplete
queryKeys.students. // จะมี autocomplete ขึ้นมา
```

---

## 📖 เอกสารเพิ่มเติม

- **REACT_QUERY_MIGRATION.md** - React Query setup guide
- **QUERY_KEYS_GUIDE.md** - Query keys complete reference
- **COMPLETE_API_MIGRATION.md** - Full migration summary

---

## 🎉 Summary

✅ **ใช้ React Query** สำหรับ Server State
✅ **ใช้ Query Keys Config** สำหรับ type-safe keys
✅ **ใช้ DevTools** สำหรับ debugging
✅ **Follow Best Practices** สำหรับ clean code

**Happy Coding! 🚀**
