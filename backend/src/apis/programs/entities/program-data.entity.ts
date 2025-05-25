/**
 * Interface สำหรับข้อมูล Program ที่ใช้ในการ import จาก XLSX
 */
export interface ProgramData {
  programId: string;
  name: string;
  description: string;
  createdBy: string;
  updatedBy: string;
}
