# แผน: ปรับหน้า /home ตามทฤษฎี 60-30-10 (Corporate) — AdminHomePage + TeacherHomePage

## หลักการสี 60-30-10 (ดึงค่าจาก Theme palette เท่านั้น — ไม่ใช้ hex ฮาร์ดโค้ด)
- **60% Neutral Canvas** → `background.default` (พื้นหลัง), `text.primary`/`text.secondary` (ตัวอักษร)
- **30% Structural Surfaces** → `Card`/`Paper` สี `background.paper` + ขอบ `alpha(divider, 0.08)` + เงานุ่ม `alpha(common.black, 0.04)`
- **10% Focal Accents** → `primary.main` (ตัวเลขสำคัญ, ปุ่ม CTA, แถบเน้น) + semantic (`success`/`error`/`warning`/`info`) เฉพาะสถานะ/ไอคอนเท่านั้น

---

## ไฟล์ที่แก้ไข

### 1. `frontend/src/views/pages/home/AdminHomePage.tsx`

**`WelcomeCard` (line 40-56)** — ทำลายบ่อเกิก "AI look":
- ลบ `linear-gradient(135deg, primary.main → primary.dark)`
- ลบ `::before` blurred orb
- ลบ `boxShadow: 0 20px 50px alpha(primary, 0.22)`
- เปลี่ยนเป็น `Card` พื้น `background.paper` + `borderLeft: '6px solid primary.main'` (accent strip เดียว 10%)
- ตัวอักษรจาก `common.white` → `text.primary`/`text.secondary`
- ลบ glass panel `rgba(255,255,255,0.12)` + `backdropFilter` (line 339-380) → เปลี่ยนเป็น `Paper variant='outlined'` สีพื้น paper ปกติ

**`MetricCard`/`ActionButton`/ส่วนอื่น** — ปรับเล็กน้อย:
- `MetricCard` boxShadow ลดจาก `alpha(common.black, 0.05)` คงไว้ (พอใช้ได้)
- ตรวจสอบว่าทุกสีอ้างอิง theme palette (ตัวอย่างปัจจุบัน `color='primary.main'` ดีอยู่แล้ว)

### 2. `frontend/src/views/pages/home/TeacherHomePage.tsx`

**`WelcomeCard` (line 78-106)**:
- ลบ gradient + `::before`/`::after` orbs + `boxShadow: rgba(79, 70, 229, 0.15)` (indigo ไม่ match)
- เปลี่ยนเป็น `Card` พื้น `background.paper` + `borderLeft: '6px solid primary.main'`
- ตัวอักษรจาก `rgba(255,255,255,...)` → `text.primary`/`text.secondary`
- Avatar: เปลี่ยน `border: 3px solid rgba(255,255,255,0.3)` → `border: 3px solid primary.main` (accent 10%)
- Glass panel ขวา (line 1038-1064): เปลี่ยนเป็น `Paper variant='outlined'`, **ใช้วันที่จริง** `formatThaiDate(new Date())` แทน "วันศุกร์ที่ 22 พฤษภาคม 2569", ดึง term จาก `apiConfig` แทน "1/2569"

**`GlassCard` (line 108-118)** → เปลี่ยนชื่อเป็น `StatCard`:
- ลบ `backdropFilter: blur(16px)` + hover lift `translateY(-4px)`
- ใช้ `Card` ปกติ + ขอบบาง + เงานุ่ม

**`QuickActionButton` (line 122-142)**:
- ลบ hover lift `translateY(-3px)` + glow shadow
- ใช้ hover `borderColor: primary.light` อย่างเดียว

**`menuList` (line 543-901)** — แก้ไขใหญ่:
- ลบฟิลด์ `color: '#...'` hex สุ่มทั้งหมด (~28 รายการ, 20 สี)
- ใช้ฟิลด์ `color` เป็น **ThemeColor key** แทน (string `'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary'`) — ไม่ต้องแก้ type `CardMenuProps.color` (ยังเป็น `string`) แค่เปลี่ยนค่าที่ใส่
- การ map ตามหมวดหมู่ (5 กลุ่ม → 5 accent):
  - บันทึกประจำวัน (เช็คชื่น, กิจกรรม) → `'primary'`
  - ความดี (goodness) → `'success'`
  - พฤติกรรมไม่เหมาะสม (badness) → `'error'`
  - รายงาน/สถิติ → `'info'`
  - จัดการ/ตั้งค่า → `'secondary'`

**ส่วน render QuickActionButton (line 1332-1365)**:
- แทน `alpha(item.color || '#4f46eh', 0.1)` → ใช้ helper map: `const paletteColor = theme.palette[item.color as ThemeColor]?.main ?? theme.palette.primary.main`
- แก้ **bug `#4f46eh`** (line 1339) และ `#4f46ef` (line 1344) → ใช้ `paletteColor` ทั้งคู่

**Emoji + ภาษา flowery**:
- ลบ emoji ใน heading/labels: 🌟 💡 📌 ⚠️ ✅ 🏆 (line 1493, 1600, 1625, 1667, 1671, 1715, 1719)
- เปลี่ยน emoji สถานะ ⚠️/✅ → `IconifyIcon` (เช่น `mdi:alert-outline`, `mdi:check-circle-outline`)
- ลดคำพูดยาวๆ เช่น "ยินดีต้อนรับเข้าสู่ระบบจัดการสถานศึกษาอัจฉริยะ..." → สั้นกระชับ

**Mock data** (line 451-505):
- ลบ mock student names/hardcoded values หรือ mark ชัดเจนว่าเป็นสถานะ "ยังไม่มีข้อมูล" แทน
- mock insight quotes พอเก็บไว้ได้ (เป็นเนื้อหา ไม่ใช่สี)

---

## ขอบเขตที่ **ไม่** แก้
- ไม่แตะ `ThemeComponent`/`palette/index.ts`/`UserThemeOptions.ts` (ใช้ค่า palette ที่มีอยู่ — `#16B1FF` primary ฯลฯ)
- ไม่เพิ่มฟิลด์ dynamic color branding ใน SystemSetting (ผู้ใช้ไม่ได้ขอ — ใช้ theme palette ที่ compile แล้วพอ)
- ไม่แก้ type `CardMenuProps.color` (คงเป็น `string`, แค่เปลี่ยนค่า)
- ไม่แตะ `StudentOverviewPage.tsx` (caller อื่นของ `CardMenuProps`)

---

## ผลลัพธ์ที่คาดหวัง
- หน้า /home ดูเป็นระบบงานทางการของวิทยาลัย ไม่ใช่ SaaS template
- สี accent (ฟ้า primary) กระจุกเฉพาะจุดที่ต้องการดึงความสนใจ (ตัวเลข, ปุ่ม, แถบซ้ายของ hero) — สัดส่วน ~10%
- Card/Paper เป็นพื้นผิว 30%, พื้นหลัง 60%
- ไม่มี gradient orbs, glassmorphism, indigo shadow ผิดโทน, hex สุ่ม, invalid hex bug, emoji ใน heading
- ใช้ค่าจาก `theme.palette.*` ทั้งหมด → เวลาเปลี่ยน themeColor (customizer) หรือ dark/light mode สีจะตามไปด้วยอัตโนมัติ

## การตรวจสอบ
- รัน `cd frontend && bun run lint` ผ่าน
- รัน `cd frontend && bunx tsc --noEmit -p tsconfig.json` ผ่าน
- ตรวจสอบด้วยตาว่าไม่มี hex ฮาร์ดโค้ดเหลือในไฟล์ที่แก้ (`grep -nE '#[0-9a-fA-F]{3,8}' frontend/src/views/pages/home/*.tsx`)