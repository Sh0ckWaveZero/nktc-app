# Vitest Setup Guide

## Overview

This project uses **Vitest** as the modern test runner for all unit and integration tests. Vitest provides faster test execution, better TypeScript support, and a seamless testing experience compared to Jest.

## Why Vitest?

✅ **5-10x faster** than Jest
✅ **ESM native** - full ES modules support
✅ **Jest compatible** - drop-in replacement for Jest
✅ **Vite powered** - same config as your build tool
✅ **TypeScript first** - built-in TypeScript support
✅ **Fast reload** - instant feedback
✅ **UI mode** - interactive test runner with visual feedback

## Installation

Dependencies have been installed automatically:

```bash
bun install
```

## Configuration Files

### 1. **vitest.config.ts** - Main Configuration
- Test environment: `happy-dom` (lightweight DOM)
- Global test utilities enabled
- TypeScript support built-in
- Path aliases configured
- Coverage thresholds: 80% for all metrics

### 2. **vitest.setup.ts** - Test Setup
- Testing Library Jest DOM matchers
- Window mock (matchMedia)
- IntersectionObserver mock
- ResizeObserver mock
- Automatic cleanup after each test

### 3. **package.json Scripts**
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

## Running Tests

### Run all tests in watch mode
```bash
npm run test
# or
bun run test
```

### Run tests once (CI mode)
```bash
npm run test -- --run
```

### Run specific test file
```bash
npm run test -- useTeachers.spec.ts
```

### Run tests matching pattern
```bash
npm run test -- --grep "useTeachers"
```

### Run with UI (Interactive Mode)
```bash
npm run test:ui
```

Opens browser at `http://localhost:51204/__vitest__/` with:
- Test tree view
- Live filtering
- Detailed output
- File editing shortcuts

### Run with Coverage
```bash
npm run test:coverage
```

Generates coverage reports in:
- `coverage/` directory
- HTML: `coverage/index.html`
- LCOV: `coverage/lcov.info`

## Test Files

All test files follow the pattern: `*.spec.ts` or `*.test.ts`

### Current Test Files

```
src/hooks/queries/__tests__/
├── useTeachers.spec.ts      (6 tests)
├── useGoodness.spec.ts      (5 tests)
├── useBadness.spec.ts       (5 tests)
├── useVisits.spec.ts        (6 tests)
└── useReports.spec.ts       (8 tests)
```

## Writing Tests with Vitest

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('myHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Mocking with Vitest

```typescript
// Mock a module
vi.mock('@/services/api');

// Mock specific function
vi.mocked(myFunction).mockResolvedValue(data);

// Reset mocks
vi.clearAllMocks();
vi.resetAllMocks();
```

### React Testing Library Integration

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should fetch data', async () => {
    const { result } = renderHook(() => useMyHook());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### React Query Testing Pattern

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = (props: any) => {
  const { children } = props;
  return (QueryClientProvider as any)({ client: queryClient, children });
};

const { result } = renderHook(() => useTeachers(), { wrapper });
```

## Common Vitest API

### Assertions
```typescript
expect(value).toBe(expectedValue)
expect(value).toEqual(expectedValue)
expect(value).toBeDefined()
expect(value).toBeNull()
expect(array).toContain(item)
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith(args)
```

### Mocking
```typescript
vi.mock('module')                    // Mock entire module
vi.spyOn(obj, 'method')             // Spy on method
vi.fn()                              // Create mock function
vi.mocked(fn)                        // Type mock function
vi.clearAllMocks()                   // Clear all mocks
vi.resetAllMocks()                   // Reset all mocks
```

### Hooks
```typescript
beforeEach(() => {})       // Run before each test
afterEach(() => {})        // Run after each test
beforeAll(() => {})        // Run once before all tests
afterAll(() => {})         // Run once after all tests
```

## Environment Variables

Tests run with `NODE_ENV=test` automatically.

Add test-specific env vars in `vitest.config.ts`:

```typescript
test: {
  env: {
    VITE_API_URL: 'http://localhost:3001',
  },
}
```

## Coverage Configuration

Coverage settings in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  lines: 80,           // 80% line coverage required
  functions: 80,       // 80% function coverage required
  branches: 80,        // 80% branch coverage required
  statements: 80,      // 80% statement coverage required
}
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests
  run: npm run test -- --run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Tests timeout
Increase timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 30000,  // 30 seconds
}
```

### Module not found errors
Check path aliases in `vitest.config.ts` match `next.config.mjs`

### Mocking not working
Ensure mocks are defined before imports:
```typescript
vi.mock('./module')  // Must be before import

import { myFunction } from './module'
```

### Tests fail in watch mode but pass in CI
Clear cache:
```bash
npm run test -- --clearCache
```

## Resources

- [Vitest Official Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/react)
- [React Query Testing](https://tanstack.com/query/latest/docs/react/testing)

## Next Steps

1. Run tests with UI: `npm run test:ui`
2. Check coverage: `npm run test:coverage`
3. Add more tests as features are developed
4. Integrate with CI/CD pipeline
