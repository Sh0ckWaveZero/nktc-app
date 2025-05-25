/**
 * Interface สำหรับข้อมูล Student ที่ใช้ในการ import จาก XLSX
 * ใช้โครงสร้างเดียวกับที่กำหนดใน userStudentData function
 */
export interface StudentData {
  // ข้อมูลหลักจาก Excel
  idCard: string;           // เลขประจำตัวประชาชน
  studentId: string;        // รหัสประจำตัวนักเรียน
  levelClassroom: string;   // กลุ่มเรียน (ใช้ในการค้นหา classroom)
  title: string;            // คำนำหน้าชื่อ
  firstName: string;        // ชื่อ (ไทย)
  lastName: string;         // นามสกุล (ไทย)
  departmentName: string;   // แผนก
  programName: string;      // สาขาวิชา
  studentType: string;      // ประเภทนักเรียน
  
  // ข้อมูลความสัมพันธ์ที่จะค้นหาจากฐานข้อมูล
  levelId?: string;
  departmentId?: string;
  programId?: string;
  classroomId?: string;
  levelClassroomId?: string;
  
  // ข้อมูล audit
  createdBy: string;
  updatedBy: string;
}
