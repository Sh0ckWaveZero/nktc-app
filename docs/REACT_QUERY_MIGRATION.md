# React Query Migration Guide

## สรุปการเปลี่ยนแปลง

โปรเจคนี้ได้ทำการ migrate จาก Zustand + axios โดยตรง ไปใช้ **React Query (@tanstack/react-query v5)** เพื่อจัดการ server state ได้ดีขึ้น

---

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. Setup React Query
- ✅ ติดตั้ง `@tanstack/react-query-devtools` (dev dependency)
- ✅ เพิ่ม `QueryClientProvider` ใน `frontend/src/app/providers.tsx`
- ✅ ตั้งค่า default options:
  - `staleTime: 60s` (1 นาที)
  - `gcTime: 300s` (5 นาที)
  - `refetchOnWindowFocus: false`
  - `retry: 1`

### 2. สร้าง Custom Hooks
สร้างโฟลเดอร์ `frontend/src/hooks/queries/` พร้อม hooks:

#### **Statistics** (`useStatistics.ts`)
- `useTermStatistics(params)` - ดึงสถิติตามเทอม

#### **Students** (`useStudents.ts`)
- `useStudents(params)` - ดึงรายการนักเรียน
- `useStudentsSearch(params)` - ค้นหานักเรียน
- `useStudent(studentId)` - ดึงข้อมูลนักเรียนตาม ID
- `useUpdateStudent()` - อัพเดทข้อมูลนักเรียน (mutation)
- `useCreateStudent()` - สร้างนักเรียนใหม่ (mutation)
- `useDeleteStudent()` - ลบนักเรียน (mutation)
- `useStudentTrophyOverview(studentId)` - ดึงภาพรวมรางวัล

#### **Departments & Programs** (`useDepartments.ts`)
- `useDepartments()` - ดึงรายการแผนก (cache 30 นาที)
- `usePrograms()` - ดึงรายการสาขาวิชา (cache 30 นาที)

#### **User Projects** (`useUserProjects.ts`)
- `useUserProjects(query)` - ดึงรายการโปรเจคผู้ใช้

#### **Export** (`index.ts`)
- Centralized exports ทุก hooks

### 3. Migration Files

#### **TermStatisticsPage** ✅
**ไฟล์:** `frontend/src/views/apps/admin/reports/statistics/TermStatisticsPage.tsx`

**เปลี่ยนจาก:**
```typescript
// ❌ เดิม: Zustand + manual state management
const { getTermStatistics } = useStatisticsStore();
const [statistics, setStatistics] = useState(null);
const [isLoadingData, setIsLoadingData] = useState(false);

useEffect(() => {
  fetchStatistics();
}, [termStartDate, termEndDate]);
```

**เป็น:**
```typescript
// ✅ ใหม่: React Query - auto refetch on params change
const queryParams = useMemo(() => ({
  startDate: formatDateForAPI(termStartDate),
  endDate: formatDateForAPI(termEndDate),
  departmentId: departmentFilter,
  programId: programFilter,
}), [termStartDate, termEndDate, departmentFilter, programFilter]);

const { data: statistics, isLoading: isLoadingData, error } = useTermStatistics(queryParams);
const { data: departments = [] } = useDepartments();
const { data: programs = [] } = usePrograms();
```

**ประโยชน์:**
- ✅ ลบ manual state management (70+ บรรทัด)
- ✅ ลบ useEffect dependencies
- ✅ Auto refetch เมื่อ params เปลี่ยน
- ✅ Caching อัตโนมัติ
- ✅ Error handling ที่ดีกว่า

---

#### **UsersProjectListTable** ✅
**ไฟล์:** `frontend/src/views/apps/student/view/UsersProjectListTable.tsx`

**เปลี่ยนจาก:**
```typescript
// ❌ เดิม: axios โดยตรง
import axios from 'axios';

const [data, setData] = useState([]);

useEffect(() => {
  axios.get('/apps/users/project-list', { params: { q: value } })
    .then((res) => setData(res.data));
}, [value]);
```

**เป็น:**
```typescript
// ✅ ใหม่: React Query hook
import { useUserProjects } from '@/hooks/queries';

const { data = [], isLoading, error } = useUserProjects(value);

// Loading state
{isLoading && <CircularProgress />}

// Error handling
{error && <Alert severity="error">Error loading projects</Alert>}
```

**ประโยชน์:**
- ✅ ลบ axios import
- ✅ ลบ manual state management
- ✅ Auto refetch on search
- ✅ Loading & Error states
- ✅ Type-safe

---

#### **useQueryImage** ✅
**ไฟล์:** `frontend/src/hooks/useQueryImage.tsx`

**อัพเดท:**
- ✅ อัพเดทจาก React Query v4 → v5 syntax
- ✅ เปลี่ยน `cacheTime` → `gcTime`
- ✅ ลบ `onSuccess` callback (deprecated)
- ✅ เพิ่ม `enabled: !!url`

---

## 📊 เปรียบเทียบก่อน-หลัง

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Code Lines** (TermStatisticsPage) | 666 | ~580 | -13% |
| **Manual State** | 8 useState | 3 useState | -63% |
| **useEffect** | 3 effects | 0 effects | -100% |
| **API Calls** | Manual | Auto-managed | ∞ |
| **Caching** | None | Built-in | ✅ |
| **Error Handling** | Manual try/catch | Auto | ✅ |
| **Loading States** | Manual | Auto | ✅ |

---

## 🎯 แนวทางการใช้งานต่อไป

### **1. Server State** → React Query ✅
ใช้สำหรับข้อมูลจาก API ทั้งหมด

**ตัวอย่าง:**
```typescript
import { useStudents } from '@/hooks/queries';

const StudentListPage = () => {
  const { data: students, isLoading, error } = useStudents({ classroomId: '123' });

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return <StudentList students={students} />;
};
```

---

### **2. UI State** → Zustand
ใช้สำหรับ Global UI state เท่านั้น

**ตัวอย่าง:**
```typescript
// Settings, Theme, Modal states, Navigation
const useAppStore = create((set) => ({
  theme: 'light',
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

---

### **3. Simple Actions** → apiService
ใช้สำหรับ one-time actions

**ตัวอย่าง:**
```typescript
// Logout, File upload, Delete
const handleLogout = async () => {
  await apiService.logout();
  router.push('/login');
};
```

---

## 🚀 วิธีสร้าง Query Hook ใหม่

### **Query (GET)**
```typescript
// frontend/src/hooks/queries/useClassrooms.ts
import { useQuery } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';

export const useClassrooms = () => {
  return useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const { data } = await httpClient.get('/classrooms');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### **Mutation (POST/PUT/DELETE)**
```typescript
// frontend/src/hooks/queries/useCreateClassroom.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';

export const useCreateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await httpClient.post('/classrooms', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });
};

// การใช้งาน
const { mutate: createClassroom, isPending } = useCreateClassroom();

const handleSubmit = (data) => {
  createClassroom(data, {
    onSuccess: () => toast.success('สร้างห้องเรียนสำเร็จ'),
    onError: () => toast.error('เกิดข้อผิดพลาด'),
  });
};
```

---

## 🔧 React Query DevTools

**เปิดใช้งาน:**
- เฉพาะ development mode
- กดปุ่ม React Query logo ที่มุมล่างซ้าย
- ดูได้:
  - Query status (fresh, fetching, stale)
  - Cache data
  - Query keys
  - Refetch manually

---

## 📚 Resources

- [React Query v5 Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Migration Guide v4 → v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)
- [React Query Examples](https://tanstack.com/query/latest/docs/framework/react/examples/simple)

---

## ⏭️ Next Steps (แนะนำ)

### **Phase 2: Migrate Zustand Stores**
- [ ] `frontend/src/store/apps/student/index.ts` → React Query
- [ ] `frontend/src/store/apps/teacher/index.ts` → React Query
- [ ] `frontend/src/store/apps/class-room/index.ts` → React Query

### **Phase 3: Optimize Queries**
- [ ] เพิ่ม prefetching สำหรับ navigation
- [ ] ใช้ `useInfiniteQuery` สำหรับ pagination
- [ ] เพิ่ม optimistic updates

### **Phase 4: Clean Up**
- [ ] ลบ Zustand stores ที่ไม่ใช้
- [ ] ลบ manual state management
- [ ] Refactor apiService methods

---

## 🎉 Summary

✅ **React Query Setup Complete**
✅ **2 Files Migrated** (TermStatisticsPage, UsersProjectListTable)
✅ **5 Query Hooks Created** (Statistics, Students, Departments, Programs, UserProjects)
✅ **1 Hook Updated** (useQueryImage)
✅ **DevTools Installed**

**Result:** Better caching, auto refetch, less boilerplate, improved UX! 🚀
