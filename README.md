# 🏫 NKTC Student Management System

ระบบจัดการและดูแลช่วยเหลือนักเรียนของวิทยาลัยเทคนิค - ระบบครบวงจรสำหรับการบริหารจัดการข้อมูลนักเรียน การเช็คชื่อ การประเมินพฤติกรรม และการเยี่ยมบ้าน

## ✨ ฟีเจอร์หลักที่มีในระบบ

### 👥 การจัดการผู้ใช้งาน

- **นักเรียน** - จัดการข้อมูลส่วนตัว, ประวัติการศึกษา, สถานะการเรียน
- **ครู/บุคลากร** - จัดการข้อมูลครู, การมอบหมายงาน, การดูแลนักเรียน
- **ผู้ดูแลระบบ** - จัดการระบบ, สิทธิ์การเข้าถึง, การตั้งค่า

### 🏫 การจัดการข้อมูลการศึกษา

- **แผนกวิชา** - จัดการแผนกต่างๆ ในวิทยาลัย
- **สาขาวิชา** - จัดการสาขาวิชาและหลักสูตร
- **ห้องเรียน** - จัดการห้องเรียนและการจัดกลุ่มนักเรียน
- **ระดับชั้น** - จัดการระดับการศึกษา (ปวช., ปวส.)

### ✅ ระบบเช็คชื่อ

- **เช็คชื่อหน้าเสาธง** - เช็คชื่อประจำวันในตอนเช้า
- **เช็คชื่อกิจกรรม** - เช็คชื่อในกิจกรรมพิเศษต่างๆ
- **รายงานการเช็คชื่อ** - รายวัน, รายสัปดาห์, รายเดือน
- **สถิติการเข้าเรียน** - วิเคราะห์แนวโน้มการเข้าเรียน

### 🏆 ระบบประเมินพฤติกรรม

- **บันทึกความดี** - บันทึกพฤติกรรมดีของนักเรียน (รายบุคคล/รายกลุ่ม)
- **บันทึกพฤติกรรมไม่เหมาะสม** - บันทึกพฤติกรรมที่ต้องปรับปรุง
- **ระบบคะแนนพฤติกรรม** - คำนวณและจัดอันดับคะแนนพฤติกรรม
- **รายงานพฤติกรรม** - สรุปผลการประเมินพฤติกรรม

### 🏠 ระบบเยี่ยมบ้าน

- **การจัดการการเยี่ยมบ้าน** - วางแผนและบันทึกการเยี่ยมบ้าน
- **แบบสำรวจ** - แบบฟอร์มสำรวจสภาพครอบครัวและสิ่งแวดล้อม
- **รายงานการเยี่ยมบ้าน** - สรุปผลการเยี่ยมบ้านและข้อเสนอแนะ

### 📊 ระบบรายงานและสถิติ

- **Dashboard** - ภาพรวมข้อมูลสำคัญ
- **รายงานการเช็คชื่อ** - สถิติการเข้าเรียนแบบละเอียด
- **รายงานพฤติกรรม** - วิเคราะห์แนวโน้มพฤติกรรมนักเรียน
- **รายงานสำหรับผู้บริหาร** - ข้อมูลสำหรับการตัดสินใจ

### 🔒 ระบบความปลอดภัย

- **Authentication & Authorization** - ระบบล็อกอินและจัดการสิทธิ์
- **Audit Log** - บันทึกการใช้งานระบบ
- **Rate Limiting** - ป้องกันการใช้งานเกินขีดจำกัด
- **Data Encryption** - เข้ารหัสข้อมูลสำคัญ

## 🏗️ โครงสร้างโปรเจกต์

```
nktc-app/
├── frontend/          # Next.js 15 + React 19 + TypeScript + Material-UI
├── backend/           # NestJS 11 + TypeScript + Prisma + PostgreSQL/MongoDB
├── turbo.json         # Turbo Repo configuration
├── package.json       # Root package.json (Monorepo)
└── bun.lock          # Bun lockfile
```

## 🚀 การติดตั้งและรัน

### ข้อกำหนดระบบ

- Node.js >= 18.0.0
- Bun >= 1.0.0
- PostgreSQL
- MinIO (สำหรับ file storage)

### การติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies ทั้งหมด
bun install

# หรือติดตั้งแยกตาม workspace
bun install --cwd frontend
bun install --cwd backend
```

### การรันโปรเจกต์

```bash
# รันทั้งสองโปรเจกต์พร้อมกัน (stream mode - สามารถ copy text ได้)
bun run dev

# รันแบบ TUI (Terminal User Interface - สวยงามแต่ copy text ยาก)
bun run dev:tui

# รันแบบ stream (แสดงผล log แบบ text ธรรมดา - copy text ได้ง่าย)
bun run dev:stream

# รัน frontend เท่านั้น (http://localhost:3000)
bun run dev:frontend

# รัน backend เท่านั้น (http://localhost:3001)
bun run dev:backend
```

### การ Build

```bash
# Build ทั้งสองโปรเจกต์
bun run build

# Build แยกกัน
bun run build:frontend
bun run build:backend
```

### การ Lint และ Test

```bash
# Lint ทั้งหมด
bun run lint

# Test ทั้งหมด
bun run test
```

## 🎛️ Turbo UI Modes

Turbo Repo รองรับ UI modes ต่างๆ สำหรับการแสดงผล:

- **Stream Mode** (default): แสดงผล log แบบ text ธรรมดา สามารถ copy text ได้ง่าย
- **TUI Mode**: Terminal User Interface ที่สวยงาม แต่ copy text ได้ยาก

```bash
# เปลี่ยน UI mode ได้ตามต้องการ
bun run dev:stream  # สำหรับ copy text
bun run dev:tui     # สำหรับ UI ที่สวยงาม
```

## 🛠️ เทคโนโลยีที่ใช้

### Frontend Stack

- **Next.js 15.4.2** - React Framework with App Router
- **React 19.1.0** - UI Library with latest features
- **TypeScript 5.8.3** - Type Safety และ Developer Experience
- **Material-UI (MUI)** - UI Component Library
- **Zustand** - Lightweight State Management
- **React Hook Form** - Form Management และ Validation
- **React Query/TanStack Query** - Server State Management
- **Iconify** - Icon System

### Backend Stack

- **NestJS 11.x** - Scalable Node.js Framework
- **TypeScript 5.8.3** - Type Safety สำหรับ Backend
- **Prisma 6.0.0** - Modern Database ORM
- **PostgreSQL** - Primary Relational Database
- **MongoDB** - Secondary NoSQL Database (สำหรับ Audit Logs)
- **JWT** - JSON Web Token Authentication
- **Passport.js** - Authentication Middleware
- **MinIO** - S3-Compatible Object Storage
- **Bcrypt** - Password Hashing
- **Class Validator** - DTO Validation
- **Swagger/OpenAPI** - API Documentation
- **SWC** - Fast TypeScript/JavaScript Compiler

### DevOps & Tools

- **Turbo Repo** - High-performance Monorepo Management
- **Bun** - Fast Package Manager & JavaScript Runtime
- **Docker** - Containerization
- **Docker Compose** - Multi-container Development
- **ESLint** - Code Linting และ Quality
- **Prettier** - Code Formatting
- **Husky** - Git Hooks
- **GitHub Actions** - CI/CD Pipeline

### Security & Performance

- **Helmet** - Security Headers
- **Rate Limiting** - API Rate Protection
- **CORS** - Cross-Origin Resource Sharing
- **Request IP** - IP Address Tracking
- **UA Parser** - User Agent Analysis
- **SWC** - Fast TypeScript/JavaScript Compiler

## 📱 หน้าจอและฟังก์ชันการทำงาน

### 🏠 หน้าหลัก (Dashboard)

- ภาพรวมข้อมูลสำคัญของระบบ
- สถิติการเช็คชื่อรายวัน
- สรุปคะแนนพฤติกรรม
- ข้อมูลนักเรียนและครู

### 👥 จัดการข้อมูลบุคคล

- **รายชื่อครู/บุคลากร** - ดู แก้ไข เพิ่ม ข้อมูลครูและบุคลากร
- **รายชื่อนักเรียน** - ดู แก้ไข เพิ่ม ข้อมูลนักเรียน
- **ข้อมูลส่วนตัว** - จัดการข้อมูลส่วนตัวของผู้ใช้งาน

### ⚙️ การตั้งค่าระบบ

- **ห้องเรียน** - จัดการห้องเรียนและการจัดกลุ่ม
- **สาขาวิชา** - จัดการสาขาวิชาและหลักสูตร
- **ปฏิทิน** - จัดการปฏิทินกิจกรรม

### ✅ ระบบเช็คชื่อ

- **เช็คชื่อหน้าเสาธง** - เช็คชื่อประจำวันตอนเช้า
- **เช็คชื่อกิจกรรม** - เช็คชื่อกิจกรรมพิเศษ

### 🌟 ระบบบันทึกพฤติกรรม

- **บันทึกความดี** (รายบุคคล/รายกลุ่ม)
- **บันทึกพฤติกรรมไม่เหมาะสม** (รายบุคคล/รายกลุ่ม)

### 🏠 ระบบเยี่ยมบ้าน

- **รายชื่อนักเรียน** - เลือกนักเรียนที่จะเยี่ยมบ้าน
- **บันทึกการเยี่ยมบ้าน** - บันทึกผลการเยี่ยมบ้าน

### 📊 รายงานต่างๆ

- **รายงานเช็คชื่อ-เช้า** (รายวัน, รายงานสรุป)
- **รายงานเช็คชื่อกิจกรรม** (รายวัน, รายงานสรุป)
- **รายงานความดี** (ทั้งหมด)
- **รายงานพฤติกรรมไม่เหมาะสม** (ทั้งหมด)

### 👨‍💼 สำหรับผู้ดูแลระบบ

- **รายงานเช็คชื่อเช้า** (รายวัน, รายสัปดาห์, รายเดือน)
- **รายงานเช็คชื่อกิจกรรม** (รายวัน, รายสัปดาห์, รายเดือน)

### 🎓 สำหรับนักเรียน

- **หน้าหลัก** - ภาพรวมข้อมูลส่วนตัว
- **รายงานการเช็คชื่อ** - ดูประวัติการเช็คชื่อของตนเอง
- **รายงานความดี** - ดูคะแนนความดีที่ได้รับ
- **รายงานความประพฤติ** - ดูบันทึกพฤติกรรมของตนเอง
- **ลำดับคะแนนความดี** - ดูอันดับคะแนนความดี
- **ลำดับคะแนนความประพฤติ** - ดูอันดับคะแนนความประพฤติ
- **ประกาศผลการเรียน** - ลิงก์ไปยังระบบผลการเรียนภายนอก

## 🗄️ โครงสร้างฐานข้อมูล

### หลักการออกแบบ

- **PostgreSQL** - ฐานข้อมูลหลักสำหรับข้อมูลหลัก
- **MongoDB** - ฐานข้อมูลรองสำหรับ Audit Logs และ Analytics
- **Prisma ORM** - จัดการฐานข้อมูลทั้งสองแบบ

### โมเดลข้อมูลหลัก

- **User** - ข้อมูลผู้ใช้งานระบบ
- **Account** - ข้อมูลส่วนตัวของผู้ใช้
- **Student** - ข้อมูลนักเรียน
- **Teacher** - ข้อมูลครูและบุคลากร
- **Department** - แผนกวิชา
- **Program** - สาขาวิชา
- **Classroom** - ห้องเรียน
- **Level** - ระดับชั้น
- **LevelClassroom** - ระดับชั้นเรียนรายสาขา
- **ReportCheckIn** - รายงานการเช็คชื่อ
- **ActivityCheckInReport** - รายงานการเช็คชื่อกิจกรรม
- **GoodnessIndividual** - บันทึกความดีรายบุคคล
- **BadnessIndividual** - บันทึกพฤติกรรมไม่เหมาะสมรายบุคคล
- **VisitStudent** - บันทึกการเยี่ยมบ้าน

## 🔧 การตั้งค่าสภาพแวดล้อม

### Frontend Environment Variables (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_EDUCATION_YEARS=2566

# App Configuration
NEXT_PUBLIC_APP_NAME="NKTC Student Management"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Backend Environment Variables (.env)

```env
# Application
NODE_ENV=development
PORT=3001
APP_NAME="NKTC Backend API"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nktc_db"
MONGODB_DATABASE_URL="mongodb://localhost:27017/nktc_mongo"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_EXPIRES_IN="7d"

# File Storage (MinIO)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="nktc-uploads"

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# CORS
CORS_ORIGIN="http://localhost:3000"
CORS_CREDENTIALS=true
```

### Database Setup

```bash
# PostgreSQL (Primary Database)
createdb nktc_db

# MongoDB (Secondary Database)
# ใช้สำหรับ Audit Logs และ Analytics

# Prisma Commands
bun run prisma:generate        # Generate Prisma Client
bun run prisma:migrate         # Run database migrations
bun run prisma:push           # Push schema to database
bun run seed                  # Seed database with initial data
```

## 🛠️ คำสั่งที่มีใช้งาน

### Root Commands (Monorepo)

```bash
# Development
bun run dev                   # รันทั้ง frontend และ backend
bun run dev:stream           # รันแบบ stream mode (copy text ได้)
bun run dev:tui              # รันแบบ TUI mode (สวยงาม)
bun run dev:frontend         # รัน frontend เท่านั้น
bun run dev:backend          # รัน backend เท่านั้น

# Build
bun run build                # Build ทั้งสองโปรเจกต์
bun run build:frontend       # Build frontend เท่านั้น
bun run build:backend        # Build backend เท่านั้น

# Quality
bun run lint                 # Lint ทั้งหมด
bun run test                 # Test ทั้งหมด
```

### Backend Commands

```bash
# Development
bun run dev                  # รัน development server
bun run start:prod          # รัน production server

# Database
bun run prisma:generate     # Generate Prisma Client
bun run prisma:migrate      # Run migrations
bun run prisma:push         # Push schema to database
bun run seed                # Seed database
bun run seed2               # Seed MongoDB

# Database Scripts
bun run db:query            # Query database
bun run db:fix-ids          # Fix undefined IDs
bun run db:enhanced-import  # Enhanced student import

# Testing
bun run test                # Unit tests
bun run test:e2e           # E2E tests
bun run test:cov           # Test coverage
```

## 📝 การพัฒนา

### Git Workflow

```bash
# สร้าง branch ใหม่
git checkout -b feature/new-feature

# Commit การเปลี่ยนแปลง
git add .
git commit -m "feat: add new feature"

# Push และสร้าง PR
git push origin feature/new-feature
```

### Code Style

- ใช้ ESLint และ Prettier สำหรับ code formatting
- ตั้งชื่อ branch ตาม convention: `feature/`, `fix/`, `chore/`
- เขียน commit message ตาม conventional commits
- ใช้ TypeScript สำหรับ type safety
- ใช้ SWC สำหรับ fast compilation

## 🤝 การมีส่วนร่วม

1. Fork โปรเจกต์
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. Push ไปยัง branch
5. สร้าง Pull Request

## 📄 License

Apache-2.0 License

## 👨‍💻 ผู้พัฒนา

- **Midseelee** - Initial work

---

สร้างด้วย ❤️
