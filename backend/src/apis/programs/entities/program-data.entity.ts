/**
 * Interface สำหรับข้อมูลสาขาวิชาที่ใช้ในการ import จาก XLSX และการอัพเดท
 */
export interface ProgramData {
  programId: string;
  name: string;
  description: string;
  levelId?: string;
  departmentId?: string;
  status?: string;
  createdBy: string;
  updatedBy: string;
}
