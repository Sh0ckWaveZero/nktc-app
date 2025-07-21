/**
 * Interface สำหรับข้อมูล Department ที่ใช้ในการ import จาก XLSX
 */
export interface DepartmentData {
  departmentId: string;
  name: string;
  description?: string;
  createdBy: string;
  updatedBy: string;
}
