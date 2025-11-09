# React 19 `use` Hook with Suspense Guide

## 📚 Overview

React 19.2.0 มี `use` hook ที่ทำให้การจัดการ async data ง่ายขึ้นมาก โดยเฉพาะเมื่อใช้ร่วมกับ Suspense

## ✨ Benefits

### 1. **No Manual Loading States**
```tsx
// ❌ Before (Manual loading state)
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  fetchData().then(setData).finally(() => setLoading(false));
}, []);

if (loading) return <Loading />;
```

```tsx
// ✅ After (With `use` hook)
const data = use(fetchDataPromise());
// Suspense handles loading automatically!
```

### 2. **Cleaner Code**
- ไม่ต้องใช้ `useEffect` เพื่อ sync loading states
- ไม่ต้องจัดการ error states แบบ manual
- Code สั้นลงและอ่านง่ายขึ้น

### 3. **Better Error Handling**
- ใช้ ErrorBoundary จัดการ errors
- Type-safe error handling
- Automatic error propagation

### 4. **Automatic Suspense Integration**
- Suspense boundary จัดการ loading state อัตโนมัติ
- สามารถใช้ nested Suspense boundaries ได้
- Better UX with loading states

## 🚀 Usage Examples

### Example 1: Basic Promise with `use`

```tsx
import { use, Suspense } from 'react';

function UserProfile({ userId }: { userId: string }) {
  // `use` hook unwraps the promise
  // If promise is pending, component suspends
  const user = use(fetchUser(userId));

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Wrap with Suspense
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userId="123" />
    </Suspense>
  );
}
```

### Example 2: React Query Integration

```tsx
import { useQuery } from '@tanstack/react-query';
import { use, Suspense } from 'react';

function TeachersList() {
  const query = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  });

  // Convert query to promise for `use` hook
  const teachersPromise = useMemo(() => {
    if (query.data) {
      return Promise.resolve(query.data);
    }
    return query.refetch().then(() => query.data);
  }, [query]);

  // Use `use` hook
  const teachers = use(teachersPromise);

  return (
    <ul>
      {teachers.map(teacher => (
        <li key={teacher.id}>{teacher.name}</li>
      ))}
    </ul>
  );
}
```

### Example 3: Zustand Store Integration

```tsx
import { use, Suspense } from 'react';
import { useTeacherStore } from '@/store/apps/teacher';

function TeachersList() {
  const fetchTeacher = useTeacherStore((state) => state.fetchTeacher);
  
  // Create promise from store action
  const teachersPromise = useMemo(() => {
    return fetchTeacher({ q: '' });
  }, [fetchTeacher]);

  // Use `use` hook
  const teachers = use(teachersPromise);

  return (
    <ul>
      {teachers.map(teacher => (
        <li key={teacher.id}>{teacher.name}</li>
      ))}
    </ul>
  );
}
```

### Example 4: Context with Promise

```tsx
import { createContext, useContext, use, Suspense } from 'react';

const UserContext = createContext<Promise<User> | null>(null);

function UserProfile() {
  const userPromise = useContext(UserContext);
  if (!userPromise) throw new Error('UserContext not provided');
  
  const user = use(userPromise);
  
  return <div>{user.name}</div>;
}

function App() {
  const userPromise = fetchUser('123');
  
  return (
    <UserContext.Provider value={userPromise}>
      <Suspense fallback={<Loading />}>
        <UserProfile />
      </Suspense>
    </UserContext.Provider>
  );
}
```

## 🔄 Migration Guide

### Step 1: Identify Manual Loading States

Look for patterns like:
- `useState` with loading boolean
- `useEffect` syncing loading states
- Manual loading checks before rendering

### Step 2: Convert to Promises

Convert your data fetching to return promises:
```tsx
// Before
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().then(setData).finally(() => setLoading(false));
}, []);
```

```tsx
// After
const dataPromise = useMemo(() => fetchData(), []);
const data = use(dataPromise);
```

### Step 3: Add Suspense Boundaries

Wrap components that use `use` hook:
```tsx
<Suspense fallback={<Loading />}>
  <YourComponent />
</Suspense>
```

### Step 4: Add Error Boundaries

```tsx
<ErrorBoundary fallback={<ErrorComponent />}>
  <Suspense fallback={<Loading />}>
    <YourComponent />
  </Suspense>
</ErrorBoundary>
```

## ⚠️ Important Notes

### 1. **`use` Hook Rules**
- Must be called unconditionally (not in loops, conditions, or callbacks)
- Must be called at the top level of component or custom hook
- Works with Promises, Context, and other React resources

### 2. **Suspense Requirements**
- Components using `use` must be wrapped in Suspense boundary
- Suspense fallback is shown while promise is pending
- Multiple Suspense boundaries can be nested

### 3. **Error Handling**
- Use ErrorBoundary for error handling
- Errors thrown from `use` hook propagate to nearest ErrorBoundary
- Can use try-catch in some cases, but ErrorBoundary is recommended

### 4. **React Query Compatibility**
- React Query v5 works well with `use` hook
- Can convert query results to promises
- Better integration than manual loading states

## 📝 Best Practices

1. **Use Suspense Boundaries Strategically**
   ```tsx
   // Good: Granular Suspense boundaries
   <Suspense fallback={<TeacherListSkeleton />}>
     <TeacherList />
   </Suspense>
   <Suspense fallback={<StudentListSkeleton />}>
     <StudentList />
   </Suspense>
   ```

2. **Create Reusable Promise Factories**
   ```tsx
   const createTeachersPromise = (params: TeacherQuery) => {
     return fetchTeachers(params);
   };
   
   const teachers = use(createTeachersPromise({ q: '' }));
   ```

3. **Combine with React Query**
   ```tsx
   // Use React Query for caching, then `use` for Suspense
   const query = useQuery({ queryKey: ['teachers'], queryFn: fetchTeachers });
   const teachers = use(query.refetch().then(() => query.data));
   ```

4. **Error Boundaries at Appropriate Levels**
   ```tsx
   // Error boundary at page level
   <ErrorBoundary>
     <Suspense fallback={<PageSkeleton />}>
       <PageContent />
     </Suspense>
   </ErrorBoundary>
   ```

## 🎯 When to Use `use` Hook

✅ **Good Use Cases:**
- Data fetching in components
- Context with promises
- React Query integration
- Async data dependencies

❌ **Avoid:**
- Side effects (use `useEffect` instead)
- Event handlers (use regular async/await)
- Conditional data fetching (use `enabled` option in React Query)

## 🔗 Resources

- [React 19 `use` Hook Documentation](https://react.dev/reference/react/use)
- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
- [React Query + Suspense Guide](https://tanstack.com/query/latest/docs/react/guides/suspense)

