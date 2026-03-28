# AGENTS.md

Codebase conventions and commands for agentic coding agents.

## Project Overview

NKTC Student Management System - Monorepo with Next.js frontend and NestJS backend.

## Build Commands

```bash
# Install dependencies
bun install

# Development (both services)
bun run dev

# Development (individual)
bun run dev:frontend    # Next.js on :3000
bun run dev:backend    # NestJS on :3001

# Build
bun run build
bun run build:frontend
bun run build:backend

# Lint
bun run lint
cd frontend && bun run lint
cd backend && bun run lint

# Format
cd frontend && bun run format
cd backend && bun run format
```

## Test Commands

```bash
# Run all tests
bun run test

# Frontend tests (Vitest)
cd frontend
bun run test                    # Run all tests
bun run test -- path/to/test.spec.ts  # Run single test file
bun run test -- --run path/to/test.spec.ts  # Run once (no watch)
bun run test:ui                 # Open Vitest UI
bun run test:coverage           # Run with coverage

# Backend tests (Jest)
cd backend
bun run test                     # Run all tests
bun run test -- path/to/test.spec.ts  # Run single test file
bun run test:watch               # Watch mode
bun run test:cov                 # With coverage
bun run test:e2e                 # E2E tests
```

## Database Commands

```bash
cd backend
bun run prisma:generate    # Generate Prisma client
bun run prisma:migrate     # Run migrations
bun run prisma:push        # Push schema (dev)
bun run seed               # Seed database
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript (no `any` types)
- Declare types for all variables, parameters, and return values
- Use interfaces for React props
- Use Generic types when appropriate
- Avoid magic numbers - define constants

### Naming Conventions

|Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `StudentListPage` |
| Files | kebab-case | `student-list-page.tsx` |
| Variables/Functions | camelCase | `handleSubmit` |
| Constants | UPPERCASE | `API_BASE_URL` |
| Boolean variables | is/has/can prefix | `isLoading`, `hasError` |
| Event handlers | handle prefix | `handleClick` |
| Custom hooks | use prefix | `useStudents` |
| Query keys | entity-based | `queryKeys.students.list()` |

### Imports Order

```typescript
// 1. External packages (React, Next, MUI, etc.)
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

// 2. Internal aliases (@/)
import { queryKeys } from '@/libs/react-query/queryKeys';
import httpClient from '@//@core/utils/http';

// 3. Types (type keyword)
import type { StudentData } from '@/types/apps/studentTypes';

// 4. Relative imports
import { unwrapResponse } from './utils';
```

### React/Next.js

- Use functional components with hooks
- Use `const` for component declarations
- Extract business logic into custom hooks
- Use React Query for server state, Zustand for UI state
- Use React Hook Form + Yup for forms

### Material-UI

- Prefer MUI components over custom HTML
- Use `sx` prop for styling (avoid CSS files)
- Use MUI breakpoints for responsive design

### State Management Pattern

```typescript
// Server State → React Query (for API data)
const { data, isLoading } = useStudents();

// Global UI State → Zustand (for app state)
const { user, setUser } = useAppStore();

// Simple API Actions → apiService (one-off requests)
await apiService.logout();

// Local State → useState/useReducer
const [open, setOpen] = useState(false);
```

### Error Handling

```typescript
// Use try-catch for async operations
try {
  const result = await apiCall();
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('เกิดข้อผิดพลาด');
}

// React Query mutations
const { mutate } = useMutation({
  onSuccess: () => toast.success('สำเร็จ'),
  onError: (error) => toast.error(error.message),
});
```

### Testing Pattern (Vitest)

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useStudents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch students list', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: mockData });
    const { result } = renderHook(() => useStudents(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockData);
  });
});
```

## Import Aliases

### Frontend (tsconfig.json)

- `@/*` → `./src/*`
- `@/@core/*` → `./src/@core/*`
- `@/configs/*` → `./src/configs/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/store/*` → `./src/store/*`
- `@/types/*` → `./src/types/*`
- `@/views/*` → `./src/views/*`
- `@/services/*` → `./src/services/*`

### Backend (tsconfig.json)

- `@/*` → `./src/*`
- `@apis/*` → `./src/apis/*`
- `@common/*` → `./src/common/*`
- `@config/*` → `./src/config/*`
- `@database/*` → `./src/database/*`
- `@utils/*` → `./src/utils/*`
- `@lib/*` → `./src/lib/*`
- `@middlewares/*` → `./src/middlewares/*`

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/@core/utils/http.ts` | HTTP client with auth interceptor |
| `frontend/src/configs/auth.ts` | API endpoints config |
| `frontend/src/libs/react-query/queryKeys.ts` | Centralized query keys |
| `frontend/src/hooks/queries/index.ts` | Query hooks exports |
| `backend/src/database/prisma/schema.prisma` | Database schema |

## Additional Rules

- Language: Thai responses, English code
- No unnecessary blank lines in functions
- One export per file (except utilities)
- Use early returns to avoid nesting
- Use JSDoc comments for public APIs (Thai with English keywords)