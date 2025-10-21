# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NKTC Student Management System - ระบบจัดการและดูแลช่วยเหลือนักเรียนของวิทยาลัยเทคนิค ระบบครบวงจรสำหรับการบริหารจัดการข้อมูlนักเรียน การเช็คชื่อ การประเมินพฤติกรรม และการเยี่ยมบ้าน

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
├── frontend/           # Next.js 15.4.2 + React 19.1.0 + TypeScript + Material-UI
├── backend/            # NestJS 11.x + TypeScript + Prisma + PostgreSQL/MongoDB
├── turbo.json          # Turbo Repo configuration
└── package.json        # Root workspace configuration
```

### Technology Stack

#### Frontend

- **Next.js 15.4.2** with App Router (migrated from Pages Router)
- **React 19.1.0** with functional components and hooks
- **TypeScript 5.8.3** for type safety
- **Material-UI 7.x** as primary UI framework
- **Zustand 4.4.4** for state management
- **React Query (@tanstack/react-query)** for server state
- **React Hook Form + Yup** for form handling and validation
- **Emotion** for CSS-in-JS styling

#### Backend

- **NestJS 11.x** with TypeScript
- **Prisma ORM** with PostgreSQL (primary) and MongoDB (secondary)
- **JWT authentication** with Passport.js
- **MinIO** for file storage
- **Class Validator** for DTO validation
- **Swagger** for API documentation

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

The project uses Next.js 15 App Router with the following key directories:

- `src/app/` - App Router pages and layouts
- `src/@core/` - Core framework components and utilities
- `src/views/` - Page-specific view components
- `src/components/` - Reusable UI components
- `src/layouts/` - Layout components
- `src/store/` - Zustand state stores
- `src/hooks/` - Custom React hooks

### Import Aliases

```typescript
// Configured in next.config.mjs
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

### Core Components

- **Layout System**: Vertical/Horizontal layouts with Material-UI
- **Auth Guards**: ACL-based access control components
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
│   └── ...
├── common/            # Shared utilities and guards
├── config/            # Configuration modules
├── database/          # Prisma schemas and migrations
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

##### **Decision Matrix:**

```typescript
// ✅ Server State → React Query
import { useStudents } from '@/hooks/queries';
import { queryKeys } from '@/libs/react-query/queryKeys';

// ✅ UI State → Zustand  
const useAppStore = create((set) => ({ ... }));

// ✅ Simple Actions → apiService
await apiService.logout();

// ❌ Never: axios โดยตรง
```

### Key Features

- **Multi-database support**: PostgreSQL + MongoDB via Prisma
- **File upload**: MinIO integration for file storage
- **Security**: Helmet, rate limiting, audit logging
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)

## Development Guidelines

### Code Standards

- Follow existing Copilot instructions in `.github/copilot-instructions.md`
- Use TypeScript strictly (no `any` types)
- Functional components with hooks for React
- Material-UI components over custom HTML elements
- Consistent naming: PascalCase for components, camelCase for functions
- File naming: kebab-case for files and directories

### State Management

- **Local state**: React useState/useReducer
- **Global state**: Zustand stores in `src/store/`
- **Server state**: React Query for API data
- **Form state**: React Hook Form with Yup validation

### Styling Approach

- Material-UI `sx` prop for component styling
- Theme-based design system
- Responsive design using MUI breakpoints
- Avoid custom CSS files, use MUI theming

### Testing Strategy

- Jest for unit testing (backend)
- React Testing Library for component testing
- E2E tests for critical user flows
- Test file naming: `*.spec.ts` or `*.test.tsx`

## Security Considerations

- Environment variables for sensitive data
- JWT token management with refresh strategy
- Input validation using class-validator (backend) and Yup (frontend)
- File upload restrictions and validation
- Rate limiting and request throttling
- Audit logging for sensitive operations

## Common Development Tasks

### Adding a New Feature Module

1. Create API module in `backend/src/apis/[feature]/`
2. Add corresponding frontend views in `frontend/src/views/[feature]/`
3. Create Zustand store if needed in `frontend/src/store/apps/[feature]/`
4. Add navigation items and routes
5. Implement proper type definitions

### Database Schema Changes

1. Modify `backend/src/database/prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create migration
3. Update DTOs and entities accordingly
4. Run `npm run prisma:generate` to update Prisma client

### Adding New UI Components

1. Create component in `frontend/src/components/` or `frontend/src/@core/components/`
2. Use Material-UI base components
3. Export proper TypeScript interfaces for props
4. Follow existing component structure and styling patterns

## Environment Setup

### Required Environment Variables

**Frontend (.env):**

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

- Primary: **Bun** (specified in package.json: `"packageManager": "bun@1.2.18"`)
- Node.js: >= 18.0.0

### Development Tools

- **Turbo Repo**: Monorepo management with caching
- **ESLint + Prettier**: Code formatting and linting
- **TypeScript**: Strict type checking across both projects
- **SWC**: Fast TypeScript/JavaScript compiler
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
