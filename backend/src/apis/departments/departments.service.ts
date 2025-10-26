import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { DepartmentData } from './entities';
import {
  XlsxImportConfig,
  createXlsxImportService,
  extractCellValue,
  validateRequiredFields,
} from '../../common/utils/xlsx-import.utils';

/**
 * Service สำหรับจัดการข้อมูลแผนกวิชา
 * ใช้ functional programming approach สำหรับการ import XLSX
 */
@Injectable()
export class DepartmentsService {
  private xlsxImportService: any;

  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // PUBLIC METHODS - XLSX IMPORT
  // =============================================================================

  /**
   * Import XLSX file สำหรับแผนกวิชา
   * @param file - ไฟล์ XLSX ที่จะ import
   * @param user - ผู้ใช้ที่ทำการ import
   * @returns ผลลัพธ์การ import
   */
  async importFromXlsx(file: Express.Multer.File, user: any) {
    return this.getXlsxImportService().importFromXlsx(file, user);
  }

  // =============================================================================
  // PUBLIC METHODS - CRUD OPERATIONS
  // =============================================================================

  /**
   * ดึงข้อมูลแผนกวิชาทั้งหมดจากฐานข้อมูล
   */
  async findAll() {
    return await this.prisma.department.findMany({
      orderBy: [
        {
          name: 'asc',
        },
      ],
    });
  }

  // =============================================================================
  // PRIVATE METHODS - XLSX IMPORT HELPERS
  // =============================================================================

  /**
   * สร้าง XLSX import service โดยใช้ functional approach แบบ lazy loading
   */
  private getXlsxImportService() {
    if (!this.xlsxImportService) {
      this.xlsxImportService = createXlsxImportService<DepartmentData>({
        getImportConfig: () => ({
          columnMapping: {
            id: 'รหัสแผนกวิชา',
            name: 'ชื่อแผนกวิชา',
            description: 'รายละเอียด',
          },
          requiredColumns: ['id', 'name'],
          entityName: 'แผนกวิชา',
        }),

        processRow: async (row, headerMap, config, user, _rowNumber) => {
          const result = await this.extractAndValidateDepartmentData(
            row,
            headerMap,
            config,
            user,
          );
          if (typeof result === 'string') {
            return { error: result };
          }
          return { data: result };
        },

        createEntity: (data: DepartmentData) =>
          this.createDepartmentEntity(data),

        prisma: this.prisma,
      });
    }
    return this.xlsxImportService;
  }

  // =============================================================================
  // PRIVATE METHODS - DATA PROCESSING
  // =============================================================================

  /**
   * ดึงและ validate ข้อมูลแผนกวิชาจากแถว Excel
   */
  private async extractAndValidateDepartmentData(
    row: any[],
    headerMap: Record<string, number>,
    config: XlsxImportConfig<DepartmentData>,
    user: any,
  ): Promise<DepartmentData | string> {
    const departmentId = extractCellValue(
      row,
      headerMap,
      config.columnMapping,
      'id',
    );
    const name = extractCellValue(row, headerMap, config.columnMapping, 'name');
    const description =
      extractCellValue(row, headerMap, config.columnMapping, 'description') ||
      '';

    const validationError = validateRequiredFields({ departmentId, name }, [
      'departmentId',
      'name',
    ]);

    if (validationError) {
      return validationError;
    }

    try {
      const existingDepartment = await this.checkDepartmentExists(departmentId);
      if (existingDepartment) {
        return `แผนกวิชารหัส "${departmentId}" มีอยู่ในระบบแล้ว`;
      }

      return {
        departmentId,
        name,
        description,
        createdBy: user.username,
        updatedBy: user.username,
      };
    } catch (error) {
      return error.message || 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล';
    }
  }

  // =============================================================================
  // PRIVATE METHODS - DATABASE QUERIES
  // =============================================================================

  /**
   * ตรวจสอบว่าแผนกวิชามีอยู่ในระบบแล้วหรือไม่
   */
  private async checkDepartmentExists(departmentId: string) {
    return this.prisma.department.findFirst({
      where: {
        OR: [
          { departmentId },
          { name: departmentId }, // กรณีที่ใช้ชื่อแผนกวิชาแทน
        ],
      },
    });
  }

  /**
   * สร้าง entity แผนกวิชาในฐานข้อมูล
   */
  private async createDepartmentEntity(data: DepartmentData): Promise<any> {
    const dateTimeInit = new Date();
    return this.prisma.department.create({
      data: {
        ...data,
        createdAt: dateTimeInit,
        updatedAt: dateTimeInit,
      },
    });
  }
}
