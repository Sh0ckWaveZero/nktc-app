# การแก้ไขปัญหา Authentication 401 Unauthorized

## ปัญหาที่พบ
ผู้ใช้ได้รับข้อความ "เนื่องจากไม่ได้รับการอนุญาตหรือหมดอายุการใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง" เสมอ

## สาเหตุที่เป็นไปได้

### 1. ❌ localStorage Key ไม่ตรงกัน (แก้ไขแล้ว)
- **ปัญหา**: httpClient ใช้ `accessToken` แต่ LocalStorageService ใช้ `access_token`
- **วิธีแก้**: เปลี่ยนให้ใช้ `access_token` ทั้งหมด

### 2. ⚠️ Token หมดอายุเร็วเกินไป
- **การตั้งค่าปัจจุบัน**: `JWT_EXPIRES_IN="6000s"` (100 นาที)
- **วิธีตรวจสอบ**:
  1. เปิด Browser DevTools → Application → Local Storage
  2. ตรวจสอบว่ามี `access_token` หรือไม่
  3. คัดลอก token ไป decode ที่ https://jwt.io
  4. ตรวจสอบ `exp` (expiration time)

### 3. ⚠️ JWT Secret ไม่ตรงกัน
- **Backend**: `JWT_SECRET=s3H6fbGvGwzeu0RTxPZFsfSqiIlAjlhiNxEbbL7n8Ec=`
- **วิธีตรวจสอบ**: ตรวจสอบว่า backend ใช้ secret ที่ถูกต้อง

### 4. ⚠️ CORS Issues
- **วิธีตรวจสอบ**: ดู Console ใน Browser DevTools
- **หากมีข้อผิดพลาด CORS**: ตรวจสอบการตั้งค่า CORS ใน backend

## วิธีการตรวจสอบและแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบ Token ใน localStorage
```javascript
// เปิด Browser Console แล้วรันคำสั่งนี้
console.log('Token:', localStorage.getItem('access_token'));
```

### ขั้นตอนที่ 2: ตรวจสอบ Request Headers
1. เปิด DevTools → Network
2. Login เข้าระบบ
3. ดู Request ที่ล้มเหลว
4. ตรวจสอบ Headers:
   - มี `Authorization: Bearer <token>` หรือไม่?
   - Token ถูกต้องหรือไม่?

### ขั้นตอนที่ 3: ตรวจสอบ Backend Response
```bash
# ทดสอบ login API
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# ทดสอบ API ที่ต้องใช้ authentication (เปลี่ยน <TOKEN> เป็น token ที่ได้จาก login)
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### ขั้นตอนที่ 4: ลบ Cache และ Login ใหม่
```javascript
// เปิด Browser Console แล้วรันคำสั่งนี้
localStorage.clear();
sessionStorage.clear();
// จากนั้น refresh หน้าเว็บและ login ใหม่
```

## การแก้ไขที่ทำไปแล้ว

### ✅ 1. แก้ไข localStorage key
**ไฟล์**: `frontend/src/@core/utils/http.ts`
```typescript
// เปลี่ยนจาก
const token = window.localStorage.getItem('accessToken');

// เป็น
const token = window.localStorage.getItem('access_token');
```

### ✅ 2. เพิ่มการตรวจสอบ window object
```typescript
if (typeof window !== 'undefined') {
  const token = window.localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
}
```

### ✅ 3. Cleanup Interceptor
```typescript
useEffect(() => {
  const interceptor = httpClient.interceptors.response.use(...);

  return () => {
    httpClient.interceptors.response.eject(interceptor);
  };
}, [logout, router]);
```

### ✅ 4. ลบ Authorization Headers ที่ซ้ำซ้อน
- ลบ manual Authorization headers จากทุก store files
- ลบ manual Authorization headers จาก hooks
- ลบ manual Authorization headers จาก view components

## การทดสอบ

### ทดสอบ Login Flow
1. เปิด Browser DevTools
2. ไปที่ Login page
3. Login ด้วย username และ password
4. ตรวจสอบ Network tab:
   - POST `/auth/login` สำเร็จหรือไม่?
   - Response มี `token` หรือไม่?
5. ตรวจสอบ Application tab → Local Storage:
   - มี `access_token` หรือไม่?

### ทดสอบ Authenticated Requests
1. หลังจาก login สำเร็จ
2. ไปที่หน้าอื่นๆ ที่ต้องใช้ authentication
3. ตรวจสอบ Network tab:
   - Request มี `Authorization: Bearer <token>` header หรือไม่?
   - Response เป็น 200 หรือ 401?

### ทดสอบ Token Expiration
1. Login เข้าระบบ
2. รอให้ token หมดอายุ (ประมาณ 100 นาที)
3. ทำ request ใดๆ
4. ควรเห็น popup แจ้งให้ login ใหม่

## หากยังมีปัญหา

### ตรวจสอบ Backend Logs
```bash
cd backend
npm run start:dev
# ดู console logs เมื่อมี 401 error
```

### ตรวจสอบ JWT Validation
```typescript
// ใน backend/src/apis/auth/jwt.strategy.ts
async validate(payload: any) {
  console.log('JWT Payload:', payload); // เพิ่ม log เพื่อดู payload
  const user = await this.authService.validateUser(payload);
  if (!user) {
    throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
  }
  return user;
}
```

### เพิ่ม Debug Logs
```typescript
// ใน frontend/src/@core/utils/http.ts
httpClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('access_token');
      console.log('Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND'); // Debug log
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## สรุป

การแก้ไขหลัก:
1. ✅ แก้ localStorage key จาก `accessToken` → `access_token`
2. ✅ เพิ่มการตรวจสอบ window object
3. ✅ Cleanup interceptor เพื่อป้องกัน memory leak
4. ✅ ลบ Authorization headers ที่ซ้ำซ้อนออก
5. ✅ แก้ backend students service filter logic

**หมายเหตุ**: หากยังพบปัญหา ให้ตรวจสอบตามขั้นตอนด้านบนและเพิ่ม debug logs เพื่อหาสาเหตุ
