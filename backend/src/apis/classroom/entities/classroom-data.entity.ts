/**
 * Interface สำหรับข้อมูล Classroom ที่ใช้ในการ import จาก XLSX
 */
export interface ClassroomData {
  classroomId: string;
  name: string;
  description?: string;
  levelId: string;
  programId?: string;
  departmentId: string;
  createdBy: string;
  updatedBy: string;
}
