# Query Keys Configuration Guide

## 📍 Location
`frontend/src/libs/react-query/queryKeys.ts`

---

## 🎯 วัตถุประสงค์

Query Keys Configuration เป็นระบบจัดการ query keys แบบรวมศูนย์สำหรับ React Query ที่ช่วยให้:

1. ✅ **Type-safe** - มี TypeScript intellisense เต็มรูปแบบ
2. ✅ **Consistent** - การตั้งชื่อ keys เป็นมาตรฐานเดียวกัน
3. ✅ **Easy Invalidation** - Invalidate queries ได้ง่าย
4. ✅ **Maintainable** - แก้ไขที่เดียว ใช้ได้ทุกที่

---

## 📖 โครงสร้าง Query Keys

### Pattern แบบมาตรฐาน

```typescript
const entityKeys = {
  all: ['entity'] as const,                        // Base key
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (filters?) => [...entityKeys.lists(), filters] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id) => [...entityKeys.details(), id] as const,
  relation: (id) => [...entityKeys.detail(id), 'relation'] as const,
};
```

### ตัวอย่าง: Students

```typescript
export const studentKeys = {
  all: ['students'],                      // ['students']
  lists: () => ['students', 'list'],      // ['students', 'list']
  list: (filters) => ['students', 'list', filters],
  // ['students', 'list', { classroomId: '123' }]

  details: () => ['students', 'detail'],  // ['students', 'detail']
  detail: (id) => ['students', 'detail', id],
  // ['students', 'detail', 'student-123']

  trophy: (id) => ['students', 'detail', id, 'trophy'],
  // ['students', 'detail', 'student-123', 'trophy']
};
```

---

## 🔧 การใช้งาน

### 1. ใน Query Hooks

```typescript
// ❌ เดิม: Hard-coded keys
import { useQuery } from '@tanstack/react-query';

export const useStudents = (filters) => {
  return useQuery({
    queryKey: ['students', 'list', filters], // ❌ ต้องจำ structure
    queryFn: fetchStudents,
  });
};

// ✅ ใหม่: ใช้ centralized keys
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/libs/react-query/queryKeys';

export const useStudents = (filters) => {
  return useQuery({
    queryKey: queryKeys.students.list(filters), // ✅ Type-safe + autocomplete
    queryFn: fetchStudents,
  });
};
```

---

### 2. ใน Mutations (Invalidation)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/react-query/queryKeys';

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStudent,
    onSuccess: (data, variables) => {
      // ✅ Invalidate specific student
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.id)
      });

      // ✅ Invalidate all students lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.lists()
      });

      // ✅ Invalidate ALL students queries (list, detail, search, etc.)
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.all
      });
    },
  });
};
```

---

### 3. ตัวอย่างการใช้ Prefetch

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/react-query/queryKeys';

const StudentListPage = () => {
  const queryClient = useQueryClient();

  const handleRowHover = (studentId: string) => {
    // Prefetch student detail เมื่อ hover
    queryClient.prefetchQuery({
      queryKey: queryKeys.students.detail(studentId),
      queryFn: () => fetchStudent(studentId),
    });
  };

  return <StudentList onRowHover={handleRowHover} />;
};
```

---

## 📚 Available Query Keys

### Statistics
```typescript
queryKeys.statistics.term(params)
// ['statistics', 'term', { startDate, endDate, ... }]
```

### Students
```typescript
queryKeys.students.all                    // ['students']
queryKeys.students.list(filters)          // ['students', 'list', filters]
queryKeys.students.search(query)          // ['students', 'search', query]
queryKeys.students.detail(id)             // ['students', 'detail', id]
queryKeys.students.trophy(id)             // ['students', 'detail', id, 'trophy']
```

### Departments
```typescript
queryKeys.departments.all                 // ['departments']
queryKeys.departments.list(filters)       // ['departments', 'list', filters]
queryKeys.departments.detail(id)          // ['departments', 'detail', id]
```

### Programs
```typescript
queryKeys.programs.all                    // ['programs']
queryKeys.programs.list(filters)          // ['programs', 'list', filters]
queryKeys.programs.detail(id)             // ['programs', 'detail', id]
```

### Teachers
```typescript
queryKeys.teachers.all                    // ['teachers']
queryKeys.teachers.list(filters)          // ['teachers', 'list', filters]
queryKeys.teachers.detail(id)             // ['teachers', 'detail', id]
queryKeys.teachers.classrooms(id)         // ['teachers', 'detail', id, 'classrooms']
queryKeys.teachers.students(id)           // ['teachers', 'detail', id, 'students']
```

### Classrooms
```typescript
queryKeys.classrooms.all                  // ['classrooms']
queryKeys.classrooms.list(filters)        // ['classrooms', 'list', filters]
queryKeys.classrooms.detail(id)           // ['classrooms', 'detail', id]
queryKeys.classrooms.students(id)         // ['classrooms', 'detail', id, 'students']
```

### Check-in
```typescript
queryKeys.checkIn.report(params)          // ['check-in', 'report', params]
queryKeys.checkIn.daily(params)           // ['check-in', 'report', 'daily', params]
```

### User Projects
```typescript
queryKeys.userProjects.list(query)        // ['user-projects', 'list', query]
```

### Images
```typescript
queryKeys.images.image(url, token)        // ['images', url, token]
```

### PDFs
```typescript
queryKeys.pdfs.pdf(url)                   // ['pdfs', url]
```

---

## 🎨 Invalidation Patterns

### 1. Invalidate Specific Item
```typescript
// Invalidate เฉพาะนักเรียนคนเดียว
queryClient.invalidateQueries({
  queryKey: queryKeys.students.detail('student-123')
});
```

### 2. Invalidate All Lists
```typescript
// Invalidate รายการนักเรียนทั้งหมด (ไม่รวม detail)
queryClient.invalidateQueries({
  queryKey: queryKeys.students.lists()
});
```

### 3. Invalidate Everything
```typescript
// Invalidate ทุกอย่างที่เกี่ยวกับนักเรียน
queryClient.invalidateQueries({
  queryKey: queryKeys.students.all
});
```

### 4. Invalidate Multiple Entities
```typescript
// Invalidate หลาย entity พร้อมกัน
const handleStudentUpdate = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });
};
```

---

## ✨ Advanced Patterns

### 1. Related Data Invalidation

```typescript
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: (_, studentId) => {
      // Invalidate student data
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(studentId)
      });

      // Invalidate all students lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.lists()
      });

      // Invalidate related classroom data
      queryClient.invalidateQueries({
        queryKey: queryKeys.classrooms.all
      });

      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: queryKeys.statistics.all
      });
    },
  });
};
```

---

### 2. Optimistic Updates

```typescript
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStudent,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.students.detail(variables.id)
      });

      // Snapshot previous value
      const previousStudent = queryClient.getQueryData(
        queryKeys.students.detail(variables.id)
      );

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.students.detail(variables.id),
        variables.data
      );

      return { previousStudent };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.students.detail(variables.id),
        context?.previousStudent
      );
    },
    onSettled: (data, error, variables) => {
      // Refetch after success or error
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.id)
      });
    },
  });
};
```

---

### 3. Conditional Queries

```typescript
const StudentProfile = ({ studentId }: { studentId?: string }) => {
  // Query จะถูก disable เมื่อไม่มี studentId
  const { data: student } = useQuery({
    queryKey: queryKeys.students.detail(studentId!),
    queryFn: () => fetchStudent(studentId!),
    enabled: !!studentId, // Only run when studentId exists
  });

  return student ? <Profile data={student} /> : <EmptyState />;
};
```

---

## 🔍 Debugging Tips

### 1. ใช้ React Query DevTools
```typescript
// DevTools จะแสดง query keys ในรูปแบบที่อ่านง่าย
// ตัวอย่าง: ['students', 'detail', 'student-123']
```

### 2. Log Query Keys
```typescript
console.log('Query Key:', queryKeys.students.detail('123'));
// Output: ['students', 'detail', '123']
```

### 3. Check Cache
```typescript
const queryClient = useQueryClient();
const cachedData = queryClient.getQueryData(
  queryKeys.students.detail('123')
);
console.log('Cached Data:', cachedData);
```

---

## 📝 Best Practices

### ✅ DO

```typescript
// ✅ ใช้ query keys จาก config
queryKey: queryKeys.students.list(filters)

// ✅ Invalidate แบบ hierarchical
queryClient.invalidateQueries({ queryKey: queryKeys.students.all })

// ✅ Type-safe parameters
const params = { classroomId: '123' };
queryKey: queryKeys.students.list(params)
```

### ❌ DON'T

```typescript
// ❌ Hard-code query keys
queryKey: ['students', 'list', filters]

// ❌ Inconsistent naming
queryKey: ['student-list', filters]  // ควรเป็น students.list
queryKey: ['studentDetails', id]     // ควรเป็น students.detail

// ❌ Missing filters in key
queryKey: ['students'] // ❌ filters จะไม่ trigger refetch
```

---

## 🚀 Adding New Entity Keys

### Template

```typescript
// frontend/src/libs/react-query/queryKeys.ts

export const newEntityKeys = {
  all: ['new-entity'] as const,
  lists: () => [...newEntityKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...newEntityKeys.lists(), filters] as const,
  details: () => [...newEntityKeys.all, 'detail'] as const,
  detail: (id: string) => [...newEntityKeys.details(), id] as const,
  // Add custom relations
  customRelation: (id: string) => [...newEntityKeys.detail(id), 'custom'] as const,
};

// Don't forget to add to queryKeys export!
export const queryKeys = {
  // ... existing keys
  newEntity: newEntityKeys,
} as const;
```

### ตัวอย่าง: เพิ่ม Activities

```typescript
export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters?: { type?: string; date?: string }) =>
    [...activityKeys.lists(), filters] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
  participants: (id: string) => [...activityKeys.detail(id), 'participants'] as const,
};

// Add to export
export const queryKeys = {
  // ... existing
  activities: activityKeys,
} as const;
```

---

## 📊 Summary

| Feature | Without Query Keys | With Query Keys |
|---------|-------------------|-----------------|
| **Type Safety** | ❌ None | ✅ Full TypeScript |
| **Consistency** | ❌ Manual | ✅ Automatic |
| **Autocomplete** | ❌ None | ✅ IntelliSense |
| **Refactoring** | ❌ Find & Replace | ✅ One Place |
| **Invalidation** | ❌ Error-prone | ✅ Easy & Safe |
| **Debugging** | ❌ Hard | ✅ DevTools Friendly |

---

## 🎉 ผลลัพธ์

✅ **Centralized Query Keys Complete!**

**ประโยชน์:**
- 🎯 **Type-safe** - TypeScript autocomplete เต็มรูปแบบ
- 🔒 **Consistent** - การตั้งชื่อเป็นมาตรฐานเดียวกัน
- 🚀 **Easy Invalidation** - Invalidate queries ได้ง่ายและถูกต้อง
- 🐛 **Better Debugging** - DevTools แสดง keys ที่อ่านง่าย
- 📦 **Maintainable** - แก้ไขที่เดียว ใช้ได้ทุกที่

---

## 📖 เอกสารเพิ่มเติม

- [React Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)
- [Query Key Factories](https://tkdodo.eu/blog/leveraging-the-query-function-context)
