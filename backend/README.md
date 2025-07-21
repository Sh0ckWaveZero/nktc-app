# 🏫 NKTC Backend API

Backend API สำหรับระบบจัดการนักเรียนวิทยาลัยเทคนิค พัฒนาด้วย NestJS, TypeScript, Prisma และ PostgreSQL

## 🚀 เทคโนโลยีที่ใช้

- **NestJS 11.x** - Node.js Framework
- **TypeScript 5.8.3** - Type Safety
- **Prisma 6.0.0** - Database ORM
- **PostgreSQL** - Primary Database
- **MongoDB** - Secondary Database (Audit Logs)
- **JWT + Passport** - Authentication
- **MinIO** - File Storage
- **Swagger** - API Documentation
- **SWC** - Fast Compiler

## 📁 โครงสร้างโปรเจกต์

```
backend/
├── src/
│   ├── apis/                 # API Modules
│   │   ├── accounts/         # จัดการข้อมูลส่วนตัว
│   │   ├── activity-check-in/ # เช็คชื่อกิจกรรม
│   │   ├── auth/             # Authentication
│   │   ├── badness-individual/ # บันทึกพฤติกรรมไม่เหมาะสม
│   │   ├── classroom/        # จัดการห้องเรียน
│   │   ├── departments/      # จัดการแผนกวิชา
│   │   ├── goodness-individual/ # บันทึกความดี
│   │   ├── programs/         # จัดการสาขาวิชา
│   │   ├── report-check-in/  # รายงานการเช็คชื่อ
│   │   ├── students/         # จัดการข้อมูลนักเรียน
│   │   ├── teachers/         # จัดการข้อมูลครู
│   │   ├── users/            # จัดการผู้ใช้งาน
│   │   └── visits/           # จัดการการเยี่ยมบ้าน
│   ├── auth/                 # Authentication Guards
│   ├── common/               # Shared Components
│   ├── config/               # Configuration Files
│   ├── database/             # Database Schemas & Seeds
│   │   ├── prisma/           # PostgreSQL Schema
│   │   └── prisma-mongodb/   # MongoDB Schema
│   ├── lib/                  # Utility Libraries
│   ├── middlewares/          # Custom Middlewares
│   ├── scripts/              # Database Scripts
│   └── utils/                # Utility Functions
├── test/                     # Test Files
└── uploads/                  # File Uploads
```

## 🛠️ การติดตั้งและรัน

### ติดตั้ง Dependencies

```bash
# ใช้ Bun (แนะนำ)
bun install

# หรือใช้ npm/yarn
npm install
yarn install
```

### การรันแอปพลิเคชัน

```bash
# Development (with SWC)
bun run dev
bun run start

# Development (with Webpack HMR)
bun run start:dev

# Production
bun run start:prod

# Debug mode
bun run start:debug
```

### Database Commands

```bash
# Generate Prisma Client
bun run prisma:generate

# Database Migration
bun run prisma:migrate

# Push Schema to Database
bun run prisma:push

# Seed Database
bun run seed
bun run seed2  # MongoDB seed

# Database Scripts
bun run db:query
bun run db:fix-ids
bun run db:enhanced-import
```

### Testing

```bash
# Unit tests
bun run test

# Watch mode
bun run test:watch

# E2E tests
bun run test:e2e

# Test coverage
bun run test:cov

# Debug tests
bun run test:debug
```

### Code Quality

```bash
# Lint
bun run lint

# Format code
bun run format

# Build
bun run build
```

## 🔧 Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ backend:

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
JWT_EXPIRES_IN="7d"

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

## 📚 API Documentation

เมื่อรันแอปพลิเคชันแล้ว สามารถเข้าถึง Swagger API Documentation ได้ที่:

- **Development**: http://localhost:3001/api
- **Production**: https://your-domain.com/api

## 🗄️ Database Schema

### หลักการออกแบบ
- **PostgreSQL** - ฐานข้อมูลหลักสำหรับข้อมูลหลัก
- **MongoDB** - ฐานข้อมูลรองสำหรับ Audit Logs
- **Prisma ORM** - จัดการฐานข้อมูลทั้งสองแบบ

### โมเดลหลัก
- `User` - ผู้ใช้งานระบบ
- `Account` - ข้อมูลส่วนตัว
- `Student` - ข้อมูลนักเรียน
- `Teacher` - ข้อมูลครู
- `Department` - แผนกวิชา
- `Program` - สาขาวิชา
- `Classroom` - ห้องเรียน
- `ReportCheckIn` - รายงานการเช็คชื่อ
- `GoodnessIndividual` - บันทึกความดี
- `BadnessIndividual` - บันทึกพฤติกรรมไม่เหมาะสม
- `VisitStudent` - บันทึกการเยี่ยมบ้าน

## 🔒 Security Features

- **JWT Authentication** - ระบบล็อกอินด้วย JWT
- **Role-based Access Control** - จัดการสิทธิ์ตามบทบาท
- **Rate Limiting** - จำกัดการเรียก API
- **CORS Protection** - ป้องกัน Cross-Origin Requests
- **Helmet Security** - Security Headers
- **Password Hashing** - เข้ารหัสรหัสผ่านด้วย Bcrypt

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t nktc-backend .

# Run container
docker run -p 3001:3001 nktc-backend
```

### Docker Compose

```bash
# Development
docker-compose -f docker-compose-dev.yml up

# Production
docker-compose -f docker-compose.yml up
```

## 👨‍💻 ผู้พัฒนา

- **Midseelee** - Initial work

## 📄 License

Apache-2.0 License
