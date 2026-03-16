# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NKTC Student Management System - ระบบจัดการและดูแลช่วยเหลือนักเรียนของวิทยาลัยเทคนิค ระบบครบวงจรสำหรับการบริหารจัดการข้อมูลนักเรียน การเช็คชื่อ การประเมินพฤติกรรม และการเยี่ยมบ้าน

### Key Features

- **การจัดการผู้ใช้งาน** - นักเรียน, ครู/บุคลากร, ผู้ดูแลระบบ
- **ระบบเช็คชื่อ** - เช็คชื่อหน้าเสาธง และเช็คชื่อกิจกรรม
- **ระบบประเมินพฤติกรรม** - บันทึกความดี และพฤติกรรมไม่เหมาะสม
- **ระบบเยี่ยมบ้าน** - การจัดการและบันทึกการเยี่ยมบ้าน
- **ระบบรายงาน** - รายงานและสถิติต่างๆ
- **การตั้งค่าระบบ** - จัดการข้อมูลพื้นฐานและสิทธิ์การใช้งาน

## Architecture

### Monorepo Structure

```
nktc-app/
├── frontend/           # Next.js 16.0.1 + React 19.2.0 + TypeScript + Material-UI
├── backend/            # NestJS 11.x + TypeScript + Prisma + PostgreSQL/MongoDB
├── turbo.json          # Turbo Repo configuration
└── package.json        # Root workspace configuration
```

### Technology Stack

#### Frontend

- **Next.js 16.0.1** with App Router and Turbopack bundler
- **React 19.2.0** with functional components and hooks
- **TypeScript 5.9.3** for type safety
- **Material-UI 7.3.5** as primary UI framework
  - MUI Icons Material 7.3.5
  - MUI Lab 7.0.1-beta.19
  - MUI X Data Grid 8.17.0
  - MUI X Date Pickers 8.17.0
- **Zustand 5.0.8** for global state management
- **React Query 5.90.7** (@tanstack/react-query) for server state management
- **React Hook Form 7.66.0 + Yup 1.7.1** for form handling and validation
- **Emotion 11.14.0** for CSS-in-JS styling
- **Additional Libraries:**
  - CASL 6.7.3 for ACL (Access Control List)
  - Axios 1.13.2 for HTTP requests
  - Date-fns 4.1.0 with Buddhist calendar support (@midseelee/date-fns-buddhist-adapter)
  - Recharts 3.3.0 for data visualization
  - Vitest 4.0.8 for testing
  - ESLint 9.39.1 with TypeScript support

#### Backend

- **NestJS 11.x** with TypeScript
- **Prisma ORM 6.19.0** with PostgreSQL (primary) and MongoDB (secondary)
- **JWT authentication** with Passport.js
- **MinIO 8.0.6** for file storage
- **Class Validator** for DTO validation
- **Swagger** for API documentation
- **SWC** for fast compilation

## Language Rules

- If prompted in Thai, respond in **English** for the main response/technical content.
- Provide the final summary in **Thai** to save tokens.
- Copilot answers in Thai; agents should follow English conventions for code/docs.

## Core Development Commands

### Project Setup

```bash
# Install all dependencies
bun install

# Install for specific workspace
bun install --cwd frontend
bun install --cwd backend
```

### Development

```bash
# Run both frontend and backend (TUI mode)
bun run dev

# Run with stream output (better for copying text)
bun run dev:stream

# Run individual services
bun run dev:frontend    # Next.js on http://localhost:3000
bun run dev:backend     # NestJS on http://localhost:3001
```

### Build & Production

```bash
# Build everything
bun run build

# Build individual services
bun run build:frontend
bun run build:backend

# Start production servers
bun run start
```

### Code Quality

```bash
# Lint all code
bun run lint

# Frontend linting with auto-fix
cd frontend && npm run lint

# Backend linting with auto-fix
cd backend && npm run lint

# Format code
cd frontend && npm run format
cd backend && npm run format
```

### Testing

```bash
# Run all tests
bun run test

# Frontend-specific testing
cd frontend && npm run test
cd frontend && npm run test:ui
cd frontend && npm run test:coverage

# Backend-specific testing
cd backend && npm run test
cd backend && npm run test:e2e
cd backend && npm run test:cov
```

### Database Operations

```bash
# Generate Prisma client
cd backend && npm run prisma:generate

# Database migrations
cd backend && npm run prisma:migrate

# Database push (development)
cd backend && npm run prisma:push

# Seed database
cd backend && npm run seed
```

## Frontend Architecture

### App Router Structure

The project uses Next.js 16 App Router with Turbopack bundler. Key directories:

- `src/app/` - App Router pages and layouts
- `src/@core/` - Core framework components and utilities
- `src/views/` - Page-specific view components (legacy from Pages Router migration)
- `src/components/` - Reusable UI components
- `src/layouts/` - Layout components
- `src/store/` - Zustand state stores
  - `src/store/apps/` - Feature-specific stores
- `src/hooks/` - Custom React hooks
  - `src/hooks/queries/` - React Query hooks for data fetching
  - `src/hooks/features/` - Feature-specific hooks
- `src/services/` - API service layer
  - `apiService.ts` - Centralized API client with axios
  - `localStorageService.ts` - Browser storage utilities
- `src/libs/` - Third-party library configurations
  - `src/libs/react-query/` - React Query configuration and query keys

### Import Aliases

```typescript
// Configured in next.config.ts (Turbopack) and tsconfig.json
'@/' - src/
'@core/' - src/@core/
'@components/' - src/components/
'@layouts/' - src/layouts/
'@utils/' - src/utils/
'@hooks/' - src/hooks/
'@store/' - src/store/
'@configs/' - src/configs/
'@context/' - src/context/
'@services/' - src/services/
'@types/' - src/types/
'@views/' - src/views/
```

### State Management Strategy

**Critical: This project uses a specific state management pattern:**

```typescript
// ✅ Server State → React Query (for API data)
import { useStudents } from "@/hooks/queries";
import { queryKeys } from "@/libs/react-query/queryKeys";

const { data, isLoading } = useStudents();

// ✅ Global UI State → Zustand (for app-wide state)
import { useAppStore } from "@/store";

const { user, setUser } = useAppStore();

// ✅ Simple API Actions → apiService (for one-off requests)
import apiService from "@/services/apiService";

await apiService.logout();

// ✅ Local Component State → useState/useReducer
const [open, setOpen] = useState(false);

// ❌ NEVER: Use axios directly
// ❌ NEVER: Mix state management patterns
```

### Core Components

- **Layout System**: Vertical/Horizontal layouts with Material-UI
- **Auth Guards**: ACL-based access control components using @casl/ability
- **Theme System**: Material-UI theming with light/dark mode
- **Navigation**: Dynamic navigation based on user permissions

## Backend Architecture

### Module Structure

```
src/
├── apis/               # Feature modules (one per domain)
│   ├── auth/          # Authentication & authorization
│   ├── students/      # Student management
│   ├── teachers/      # Teacher management
│   ├── classroom/     # Classroom management
│   ├── accounts/      # Account management
│   ├── departments/   # Department management
│   ├── programs/      # Program management
│   ├── level/         # Education level management
│   ├── report-check-in/    # Check-in reports
│   ├── activity-check-in/  # Activity check-in
│   ├── goodness-individual/  # Good behavior records
│   ├── badness-individual/   # Bad behavior records
│   ├── visits/        # Home visit records
│   ├── audit-log/     # Audit logging
│   ├── minio/         # File storage
│   └── ...
├── common/            # Shared utilities and guards
├── config/            # Configuration modules
├── database/          # Prisma schemas and migrations
│   ├── prisma/       # Prisma schema and migrations
│   ├── db/           # Database utilities
│   └── generated/    # Generated Prisma client
├── scripts/          # Database scripts and utilities
└── middlewares/       # Global middlewares
```

### Import Aliases (Backend)

```typescript
// Configured in tsconfig.json and jest.config
'@/' - src/
'@apis/' - src/apis/
'@common/' - src/common/
'@config/' - src/config/
'@database/' - src/database/
'@utils/' - src/utils/
'@lib/' - src/lib/
'@middlewares/' - src/middlewares/
```

### Key Features

- **Multi-database support**: PostgreSQL + MongoDB via Prisma
- **File upload**: MinIO integration for file storage
- **Security**: Helmet, rate limiting, audit logging
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **SWC Compilation**: Fast builds with @swc/core

## Development Guidelines

### State Management Rules

When working with frontend state:

1. **Server Data (API responses)**: Always use React Query
   - Create query hooks in `src/hooks/queries/`
   - Define query keys in `src/libs/react-query/queryKeys.ts`
   - Use mutations for write operations

2. **Global UI State**: Use Zustand
   - Create stores in `src/store/apps/[feature]/`
   - Keep stores focused on UI state, not server data

3. **Simple API Calls**: Use `apiService`
   - Import from `@/services/apiService`
   - Use for one-off operations like logout, file upload

4. **Local Component State**: Use React hooks
   - useState, useReducer for component-specific state
   - useForm from react-hook-form for forms

### Code Standards

- Use TypeScript strictly (no `any` types)
- Functional components with hooks for React
- Material-UI components over custom HTML elements
- Consistent naming: PascalCase for components, camelCase for functions
- File naming: kebab-case for files and directories

### Styling Approach

- Material-UI `sx` prop for component styling
- Theme-based design system
- Responsive design using MUI breakpoints
- Avoid custom CSS files, use MUI theming

### Testing Strategy

- Vitest for frontend unit testing
- Jest with SWC for backend unit testing
- React Testing Library for component testing
- E2E tests for critical user flows
- Test file naming: `*.spec.ts` or `*.test.tsx`

## Security Considerations

- Environment variables for sensitive data
- JWT token management with refresh strategy
- Input validation using class-validator (backend) and Yup (frontend)
- File upload restrictions and validation
- Rate limiting and request throttling
- Audit logging for sensitive operations (MongoDB)

## Common Development Tasks

### Adding a New Feature Module

1. Create API module in `backend/src/apis/[feature]/`
2. Add corresponding frontend views in `frontend/src/views/[feature]/`
3. Create React Query hooks in `frontend/src/hooks/queries/[feature].ts`
4. Create Zustand store if needed in `frontend/src/store/apps/[feature]/`
5. Add navigation items and routes
6. Implement proper type definitions

### Database Schema Changes

1. Modify `backend/src/database/prisma/schema.prisma`
2. Run `bun run prisma:migrate` (from backend dir) to create migration
3. Update DTOs and entities accordingly
4. Run `bun run prisma:generate` to update Prisma client
5. Update frontend types if schema changes affect API responses

### Adding New UI Components

1. Create component in `frontend/src/components/` or `frontend/src/@core/components/`
2. Use Material-UI base components
3. Export proper TypeScript interfaces for props
4. Follow existing component structure and styling patterns
5. Use `sx` prop for styling instead of styled-components

## Environment Setup

### Required Environment Variables

**Frontend (.env.local):**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_EDUCATION_YEARS=2566
```

**Backend (.env):**

```
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://..."
MONGODB_DATABASE_URL="mongodb://..."
JWT_SECRET="..."
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
```

### Package Manager

- Primary: **Bun 1.3.0** (specified in package.json: `"packageManager": "bun@1.3.0"`)
- Node.js: >= 18.0.0
- Bun: >= 1.0.0

### Development Tools

- **Turbo Repo**: Monorepo management with caching
- **Turbopack**: Next.js 16 default bundler (2-5x faster builds, 10x faster Fast Refresh)
- **ESLint + Prettier**: Code formatting and linting
- **TypeScript**: Strict type checking across both projects
- **SWC**: Fast TypeScript/JavaScript compiler (backend)
- **Docker**: Containerization for deployment

### MCP Servers

- **MUI MCP**: Material-UI documentation and component reference via Model Context Protocol
  - Provides AI assistants with direct access to official MUI v7 documentation
  - Installation: `claude mcp add mui-mcp -- npx -y @mui/mcp@latest`
  - Status: ✓ Connected (Project-scoped)
  - Usage: Automatically available when working with MUI components

## API Endpoints Overview

### Authentication

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token

### User Management

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Students

- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create new student
- `PUT /students/:id` - Update student

### Teachers

- `GET /teachers` - Get all teachers
- `GET /teachers/:id` - Get teacher by ID
- `POST /teachers` - Create new teacher
- `PUT /teachers/:id` - Update teacher

### Check-in Reports

- `GET /report-check-in` - Get check-in reports
- `POST /report-check-in` - Create check-in report
- `GET /activity-check-in` - Get activity check-in reports

### Behavior Records

- `GET /goodness-individual` - Get goodness records
- `POST /goodness-individual` - Create goodness record
- `GET /badness-individual` - Get badness records
- `POST /badness-individual` - Create badness record

### Home Visits

- `GET /visits` - Get visit records
- `POST /visits` - Create visit record
- `PUT /visits/:id` - Update visit record

### Settings

- `GET /classroom` - Get classrooms
- `POST /classroom` - Create classroom
- `GET /programs` - Get programs
- `POST /programs` - Create program
- `GET /departments` - Get departments

## Database Models Overview

### Core Models

- **User** - Base user authentication
- **Account** - Personal information
- **Student** - Student-specific data
- **Teacher** - Teacher-specific data
- **Department** - Academic departments
- **Program** - Academic programs/majors
- **Classroom** - Class management
- **Level** - Education levels (ปวช.1, ปวช.2, etc.)
- **LevelClassroom** - Level-specific classrooms

### Activity Models

- **ReportCheckIn** - Daily attendance records
- **ActivityCheckInReport** - Activity attendance
- **GoodnessIndividual** - Good behavior records
- **BadnessIndividual** - Inappropriate behavior records
- **VisitStudent** - Home visit records

### System Models

- **Session** - User sessions
- **VerificationToken** - Email verification
- **RolePermission** - Role-based permissions
- **UserRole** - User role assignments
