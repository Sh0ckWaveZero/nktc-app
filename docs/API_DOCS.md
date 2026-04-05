# 📚 NKTC API Documentation

## 🌐 Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://your-domain.com`

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": "string",
    "username": "string",
    "role": "User|Teacher|Admin",
    "account": {
      "firstName": "string",
      "lastName": "string"
    }
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "string"
}
```

## 👥 User Management

### Get All Users
```http
GET /users
Authorization: Bearer {token}
```

### Get User by ID
```http
GET /users/{id}
Authorization: Bearer {token}
```

### Create User
```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string",
  "role": "User|Teacher|Admin"
}
```

### Update User
```http
PUT /users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "role": "User|Teacher|Admin"
}
```

## 🎓 Student Management

### Get All Students
```http
GET /students
Authorization: Bearer {token}
Query Parameters:
- page: number (optional)
- limit: number (optional)
- search: string (optional)
- classroomId: string (optional)
- programId: string (optional)
```

### Get Student by ID
```http
GET /students/{id}
Authorization: Bearer {token}
```

### Create Student
```http
POST /students
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "string",
  "userId": "string",
  "classroomId": "string",
  "programId": "string",
  "departmentId": "string",
  "levelId": "string",
  "studentStatus": "กำลังศึกษา|ออกก่อนกำหนด|จบการศึกษา",
  "status": "normal|intern"
}
```

### Update Student
```http
PUT /students/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "string",
  "classroomId": "string",
  "programId": "string",
  "studentStatus": "string",
  "status": "string"
}
```

## 👨‍🏫 Teacher Management

### Get All Teachers
```http
GET /teachers
Authorization: Bearer {token}
Query Parameters:
- page: number (optional)
- limit: number (optional)
- search: string (optional)
- departmentId: string (optional)
```

### Get Teacher by ID
```http
GET /teachers/{id}
Authorization: Bearer {token}
```

### Create Teacher
```http
POST /teachers
Authorization: Bearer {token}
Content-Type: application/json

{
  "teacherId": "string",
  "userId": "string",
  "jobTitle": "string",
  "academicStanding": "string",
  "programId": "string",
  "departmentId": "string",
  "classroomIds": ["string"]
}
```

## ✅ Check-in Reports

### Get Check-in Reports
```http
GET /report-check-in
Authorization: Bearer {token}
Query Parameters:
- date: string (YYYY-MM-DD)
- classroomId: string (optional)
- studentId: string (optional)
- status: string (optional)
```

### Create Check-in Report
```http
POST /report-check-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "studentId": "string",
  "classroomId": "string",
  "teacherId": "string",
  "status": "มา|ขาด|สาย|ลา",
  "checkInTime": "08:00:00",
  "note": "string"
}
```

### Get Daily Check-in Summary
```http
GET /report-check-in/daily
Authorization: Bearer {token}
Query Parameters:
- date: string (YYYY-MM-DD)
- classroomId: string (optional)
```

### Get Weekly Check-in Summary
```http
GET /report-check-in/weekly
Authorization: Bearer {token}
Query Parameters:
- startDate: string (YYYY-MM-DD)
- endDate: string (YYYY-MM-DD)
- classroomId: string (optional)
```

### Get Monthly Check-in Summary
```http
GET /report-check-in/monthly
Authorization: Bearer {token}
Query Parameters:
- year: number
- month: number
- classroomId: string (optional)
```

## 🎯 Activity Check-in

### Get Activity Check-in Reports
```http
GET /activity-check-in
Authorization: Bearer {token}
Query Parameters:
- date: string (YYYY-MM-DD)
- activityName: string (optional)
- classroomId: string (optional)
```

### Create Activity Check-in Report
```http
POST /activity-check-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "activityName": "string",
  "studentId": "string",
  "classroomId": "string",
  "teacherId": "string",
  "status": "เข้าร่วม|ไม่เข้าร่วม",
  "checkInTime": "14:00:00",
  "note": "string"
}
```

## 🌟 Goodness Records

### Get Goodness Records
```http
GET /goodness-individual
Authorization: Bearer {token}
Query Parameters:
- studentId: string (optional)
- classroomId: string (optional)
- startDate: string (optional)
- endDate: string (optional)
```

### Create Goodness Record
```http
POST /goodness-individual
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "string",
  "classroomId": "string",
  "teacherId": "string",
  "goodnessType": "string",
  "description": "string",
  "score": number,
  "date": "2024-01-15",
  "note": "string"
}
```

### Get Goodness Summary
```http
GET /goodness-individual/summary
Authorization: Bearer {token}
Query Parameters:
- classroomId: string (optional)
- startDate: string (optional)
- endDate: string (optional)
```

## 👎 Badness Records

### Get Badness Records
```http
GET /badness-individual
Authorization: Bearer {token}
Query Parameters:
- studentId: string (optional)
- classroomId: string (optional)
- startDate: string (optional)
- endDate: string (optional)
```

### Create Badness Record
```http
POST /badness-individual
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "string",
  "classroomId": "string",
  "teacherId": "string",
  "badnessType": "string",
  "description": "string",
  "score": number,
  "punishment": "string",
  "date": "2024-01-15",
  "note": "string"
}
```

### Get Badness Summary
```http
GET /badness-individual/summary
Authorization: Bearer {token}
Query Parameters:
- classroomId: string (optional)
- startDate: string (optional)
- endDate: string (optional)
```

## 🏠 Home Visits

### Get Visit Records
```http
GET /visits
Authorization: Bearer {token}
Query Parameters:
- studentId: string (optional)
- teacherId: string (optional)
- status: string (optional)
```

### Create Visit Record
```http
POST /visits
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "string",
  "teacherId": "string",
  "classroomId": "string",
  "visitDate": "2024-01-15",
  "purpose": "string",
  "familyInfo": {
    "fatherName": "string",
    "motherName": "string",
    "guardianName": "string",
    "familyStatus": "string"
  },
  "homeEnvironment": {
    "houseType": "string",
    "livingCondition": "string",
    "neighborhood": "string"
  },
  "problems": ["string"],
  "suggestions": ["string"],
  "followUpActions": ["string"],
  "status": "planned|completed|cancelled",
  "note": "string"
}
```

### Update Visit Record
```http
PUT /visits/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "visitDate": "2024-01-15",
  "status": "completed",
  "actualVisitDate": "2024-01-15",
  "visitResult": "string",
  "note": "string"
}
```

## 🏫 Classroom Management

### Get All Classrooms
```http
GET /classroom
Authorization: Bearer {token}
Query Parameters:
- programId: string (optional)
- levelId: string (optional)
- departmentId: string (optional)
```

### Create Classroom
```http
POST /classroom
Authorization: Bearer {token}
Content-Type: application/json

{
  "classroomId": "string",
  "name": "string",
  "description": "string",
  "levelId": "string",
  "programId": "string",
  "departmentId": "string",
  "teacherIds": ["string"]
}
```

### Update Classroom
```http
PUT /classroom/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "teacherIds": ["string"]
}
```

## 📚 Program Management

### Get All Programs
```http
GET /programs
Authorization: Bearer {token}
Query Parameters:
- departmentId: string (optional)
```

### Create Program
```http
POST /programs
Authorization: Bearer {token}
Content-Type: application/json

{
  "programId": "string",
  "name": "string",
  "description": "string",
  "departmentId": "string",
  "levelId": "string"
}
```

### Update Program
```http
PUT /programs/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "description": "string"
}
```

## 🏢 Department Management

### Get All Departments
```http
GET /departments
Authorization: Bearer {token}
```

### Create Department
```http
POST /departments
Authorization: Bearer {token}
Content-Type: application/json

{
  "departmentId": "string",
  "name": "string",
  "description": "string"
}
```

## 📊 Statistics & Reports

### Get Dashboard Statistics
```http
GET /statics/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalStudents": number,
  "totalTeachers": number,
  "totalClassrooms": number,
  "todayCheckIn": {
    "present": number,
    "absent": number,
    "late": number,
    "excused": number
  },
  "behaviorScores": {
    "goodness": number,
    "badness": number
  },
  "recentActivities": []
}
```

### Get Check-in Statistics
```http
GET /statics/check-in
Authorization: Bearer {token}
Query Parameters:
- period: string (daily|weekly|monthly)
- startDate: string (optional)
- endDate: string (optional)
- classroomId: string (optional)
```

### Get Behavior Statistics
```http
GET /statics/behavior
Authorization: Bearer {token}
Query Parameters:
- type: string (goodness|badness)
- period: string (daily|weekly|monthly)
- startDate: string (optional)
- endDate: string (optional)
- classroomId: string (optional)
```

## 📁 File Upload

### Upload File
```http
POST /minio/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- file: File
- folder: string (optional)
```

**Response:**
```json
{
  "filename": "string",
  "url": "string",
  "size": number,
  "mimetype": "string"
}
```

### Get File
```http
GET /minio/file/{filename}
Authorization: Bearer {token}
```

## 🔍 Search & Filtering

### Global Search
```http
GET /search
Authorization: Bearer {token}
Query Parameters:
- q: string (search query)
- type: string (students|teachers|classrooms)
- limit: number (optional, default: 10)
```

## ❌ Error Responses

### Common Error Format
```json
{
  "statusCode": number,
  "message": "string",
  "error": "string",
  "timestamp": "string",
  "path": "string"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## 🔒 Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **File upload**: 20 requests per minute per user

## 📝 Request/Response Examples

### Create Student with Account
```http
POST /students
Authorization: Bearer {token}
Content-Type: application/json

{
  "user": {
    "username": "student001",
    "password": "password123",
    "email": "student001@example.com",
    "account": {
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "idCard": "1234567890123",
      "birthDate": "2005-01-15",
      "phone": "0812345678",
      "addressLine1": "123 หมู่ 1",
      "subdistrict": "ตำบลตัวอย่าง",
      "district": "อำเภอตัวอย่าง",
      "province": "จังหวัดตัวอย่าง",
      "postcode": "12345"
    }
  },
  "studentId": "STD001",
  "classroomId": "classroom-id",
  "programId": "program-id",
  "departmentId": "department-id",
  "levelId": "level-id"
}
```

### Bulk Check-in
```http
POST /report-check-in/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "classroomId": "classroom-id",
  "teacherId": "teacher-id",
  "checkIns": [
    {
      "studentId": "student-1",
      "status": "มา",
      "checkInTime": "08:00:00"
    },
    {
      "studentId": "student-2",
      "status": "สาย",
      "checkInTime": "08:15:00"
    },
    {
      "studentId": "student-3",
      "status": "ขาด"
    }
  ]
}
```

---

## 📚 Additional Resources

- **Swagger UI**: `/api` (when server is running)
- **Postman Collection**: Available in `/docs/postman/`
- **Database Schema**: See `backend/src/database/prisma/schema.prisma`
- **Frontend Integration**: See `frontend/src/services/api/`

---

สร้างด้วย ❤️ โดยทีมพัฒนา NKTC