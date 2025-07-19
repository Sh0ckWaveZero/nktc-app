# NKTC Student Management System

ระบบดูแลช่วยเหลือนักเรียนของวิทยาลัยเทคนิค

## 🏗️ โครงสร้างโปรเจกต์

```
nktc-app/
├── frontend/          # Next.js + React + TypeScript
├── backend/           # NestJS + TypeScript + Prisma
├── turbo.json         # Turbo Repo configuration
├── package.json       # Root package.json
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
# รันทั้งสองโปรเจกต์พร้อมกัน
bun run dev

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

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **Next.js 15.4.2** - React Framework
- **React 19.1.0** - UI Library
- **TypeScript 5.8.3** - Type Safety
- **Material-UI** - UI Components
- **Zustand** - State Management
- **React Hook Form** - Form Management

### Backend
- **NestJS 11.x** - Node.js Framework
- **TypeScript** - Type Safety
- **Prisma** - Database ORM
- **PostgreSQL** - Primary Database
- **MongoDB** - Secondary Database
- **JWT** - Authentication
- **MinIO** - File Storage

### DevOps
- **Turbo Repo** - Monorepo Management
- **Bun** - Package Manager & Runtime
- **ESLint** - Code Linting
- **Prettier** - Code Formatting

## 📁 ฟีเจอร์หลัก

- 👥 **การจัดการผู้ใช้งาน** - นักเรียน, ครู, ผู้ดูแลระบบ
- 🏫 **การจัดการข้อมูลการศึกษา** - แผนก, สาขา, ห้องเรียน
- ✅ **ระบบเช็คชื่อ** - หน้าเสาธง, กิจกรรม
- 🏆 **ระบบประเมินพฤติกรรม** - ความดี, พฤติกรรมไม่เหมาะสม
- 🏠 **ระบบเยี่ยมบ้าน** - การเยี่ยมบ้านนักเรียน
- 📊 **ระบบรายงาน** - สถิติและรายงานต่างๆ
- 🔒 **ระบบความปลอดภัย** - Audit Log, Rate Limiting

## 🔧 การตั้งค่าสภาพแวดล้อม

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_EDUCATION_YEARS=2566
```

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://..."
MONGODB_DATABASE_URL="mongodb://..."
JWT_SECRET="..."
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
# ... และอื่นๆ
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

สร้างด้วย ❤️ สำหรับวิทยาลัยเทคนิค