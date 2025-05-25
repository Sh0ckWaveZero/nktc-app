# Department Upload API

API สำหรับนำเข้าข้อมูลแผนกวิชาจากไฟล์ Excel (.xlsx)

## Endpoint

```
POST /departments/upload
```

## Authorization

- **ต้องมี JWT Token**: Authorization Bearer {token}
- **Role ที่อนุญาต**: Admin เท่านั้น

## Request

### Headers
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {JWT_TOKEN}`

### Body (Form Data)
- `file`: ไฟล์ Excel (.xlsx) ที่มีข้อมูลแผนกวิชา

## Excel File Format

### คอลัมน์ที่จำเป็น (Required)
- **รหัสแผนกวิชา**: รหัสเฉพาะของแผนกวิชา
- **ชื่อแผนกวิชา**: ชื่อของแผนกวิชา

### คอลัมน์เสริม (Optional)
- **รายละเอียด**: รายละเอียดของแผนกวิชา

### ตัวอย่างรูปแบบไฟล์ Excel

| รหัสแผนกวิชา | ชื่อแผนกวิชา | รายละเอียด |
|--------------|-------------|-----------|
| DEPT001      | วิศวกรรมศาสตร์ | แผนกวิศวกรรมศาสตร์ |
| DEPT002      | ครุศาสตร์ | แผนกครุศาสตร์ |
| DEPT003      | บริหารธุรกิจ | แผนกบริหารธุรกิจ |

## Response

### Successful Response (200 OK)
```json
{
  "importedCount": 3,
  "messages": ["นำเข้าข้อมูลแผนกวิชา 3 รายการสำเร็จ"],
  "errors": [],
  "success": true
}
```

### Error Response (400 Bad Request)
```json
{
  "importedCount": 1,
  "messages": ["นำเข้าข้อมูลแผนกวิชา 1 รายการสำเร็จ"],
  "errors": [
    "บรรทัดที่ 3: แผนกวิชารหัส \"DEPT002\" มีอยู่ในระบบแล้ว",
    "บรรทัดที่ 4: ไม่พบข้อมูลที่จำเป็น: ชื่อแผนกวิชา"
  ],
  "success": false
}
```

## การใช้งาน

### cURL Example
```bash
curl -X POST \
  'http://localhost:3000/departments/upload' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@departments.xlsx'
```

### JavaScript/Fetch Example
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/departments/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

## Error Handling

### การตรวจสอบข้อมูล
- ระบบจะตรวจสอบว่าคอลัมน์ที่จำเป็นมีข้อมูลครบถ้วน
- ระบบจะตรวจสอบว่ารหัสแผนกวิชาซ้ำกับข้อมูลในระบบหรือไม่
- ข้อมูลที่ผิดพลาดจะถูกข้ามและระบบจะแจ้งรายละเอียดใน `errors` array

### ข้อจำกัด
- ไฟล์ต้องเป็นนามสกุล .xlsx เท่านั้น
- ขนาดไฟล์สูงสุด 10MB
- รองรับเฉพาะ Admin role เท่านั้น

## Database Schema

ข้อมูลจะถูกบันทึกลงในตาราง `department` ด้วยฟิลด์:
- `id`: Primary key (auto-generated)
- `departmentId`: รหัสแผนกวิชา 
- `name`: ชื่อแผนกวิชา
- `description`: รายละเอียด
- `createdAt`, `updatedAt`: วันที่สร้างและแก้ไข
- `createdBy`, `updatedBy`: ผู้สร้างและผู้แก้ไข
