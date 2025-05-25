# คำแนะนำด้านความปลอดภัย (Security Guidelines)

## ฟีเจอร์ความปลอดภัยที่เพิ่มเติม

### 1. Security Headers
- **Helmet.js**: ป้องกันภัยคุกคามทั่วไป
- **CSP (Content Security Policy)**: ป้องกัน XSS attacks
- **HSTS**: บังคับใช้ HTTPS
- **X-Frame-Options**: ป้องกัน clickjacking
- **Permissions Policy**: จำกัดการเข้าถึง browser APIs

### 2. Rate Limiting
- **Global Rate Limiting**: จำกัดคำขอทั่วไป
- **Auth Rate Limiting**: จำกัดการเข้าสู่ระบบ
- **Upload Rate Limiting**: จำกัดการอัปโหลดไฟล์

### 3. Input Validation & Sanitization
- **Strict Validation**: ตรวจสอบข้อมูลอย่างเข้มงวด
- **Whitelist Approach**: ยอมรับเฉพาะข้อมูลที่กำหนด
- **Anti Mass Assignment**: ป้องกัน mass assignment
- **Prototype Pollution Protection**: ป้องกัน prototype pollution

### 4. CORS Security
- **Origin Validation**: ตรวจสอบ origin ที่อนุญาต
- **Environment-based Configuration**: แยกการตั้งค่าตาม environment
- **Subdomain Support**: รองรับ subdomain ใน production

### 5. Request Monitoring
- **Suspicious Pattern Detection**: ตรวจสอบ SQL injection, XSS, Path traversal
- **Bot Detection**: ตรวจจับ bot และ crawler
- **Request Logging**: บันทึก request ที่น่าสงสัย

## การใช้งาน Rate Limiting

### ใน Controller:
```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  async login() {
    // ตรรกะการเข้าสู่ระบบ
  }
  
  @Post('upload')
  @Throttle({ upload: { limit: 10, ttl: 60000 } }) // 10 uploads per minute
  async upload() {
    // ตรรกะการอัปโหลด
  }
}
```

## การตั้งค่า Environment Variables

### Development:
```env
NODE_ENV=development
HOST=localhost:3000
```

### Production:
```env
NODE_ENV=production
HOST=yourdomain.com,api.yourdomain.com
```

## การ Monitor และ Alert

### Log Patterns ที่ควรติดตาม:
1. **CORS blocked requests**: การพยายามเข้าถึงจาก origin ที่ไม่อนุญาต
2. **Suspicious requests**: คำขอที่มี pattern ที่น่าสงสัย
3. **Rate limit exceeded**: การพยายามส่งคำขอเกินจำกัด
4. **Unauthorized access**: การพยายามเข้าถึงโดยไม่ได้รับอนุญาต

### แนะนำให้ใช้:
- **Log Aggregation**: ELK Stack, Splunk
- **Monitoring**: Prometheus, Grafana
- **Alerting**: PagerDuty, Slack notifications

## Best Practices

### 1. Environment Configuration
- แยกการตั้งค่าตาม environment
- ไม่เปิดเผยข้อมูลระบบใน error messages
- ใช้ HTTPS ใน production

### 2. Authentication & Authorization
- ใช้ JWT tokens ที่มี expiration
- Implement refresh token mechanism
- ใช้ bcrypt สำหรับ password hashing

### 3. Database Security
- ใช้ parameterized queries
- Implement database connection pooling
- Regular database backups

### 4. File Upload Security
- Validate file types และขนาด
- Scan uploaded files for malware
- Store files outside web root

### 5. Regular Updates
- อัปเดต dependencies เป็นประจำ
- Monitor security advisories
- Implement automated security testing

## การทดสอบความปลอดภัย

### Tools ที่แนะนำ:
- **OWASP ZAP**: Web application security testing
- **Snyk**: Dependency vulnerability scanning
- **ESLint Security Plugin**: Static code analysis
- **npm audit**: Node.js package vulnerability check

### คำสั่งสำหรับตรวจสอบ:
```bash
# ตรวจสอบ dependencies
npm audit

# ตรวจสอบด้วย Snyk
npx snyk test

# ตรวจสอบ ESLint security rules
npx eslint . --ext .ts --config .eslintrc-security.js
```
