import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { ProgramData } from './entities';
import { 
  XlsxImportConfig, 
  createXlsxImportService,
  extractCellValue,
  validateRequiredFields
} from '@common/utils/xlsx-import.utils';

/**
 * Service สำหรับจัดการข้อมูลโปรแกรม/หลักสูตร
 * ใช้ functional programming approach สำหรับการ import XLSX
 */
@Injectable()
export class ProgramsService {
  private xlsxImportService: any;

  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // PUBLIC METHODS - XLSX IMPORT
  // =============================================================================

  /**
   * Import XLSX file สำหรับโปรแกรม
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
   * ดึงข้อมูลโปรแกรมทั้งหมดจากฐานข้อมูล
   * จัดเรียงตามชื่อโปรแกรมจาก A-Z
   * 
   * @returns Promise ที่ resolve เป็น array ของโปรแกรมทั้งหมด
   */
  async findAll() {
    return await this.prisma.program.findMany({
      orderBy: {
        name: 'asc',
      },
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
      this.xlsxImportService = createXlsxImportService<ProgramData>({
        getImportConfig: () => ({
          columnMapping: {
            'id': 'รหัส',
            'name': 'ชื่อ',
            'description': 'รายละเอียด',
          },
          requiredColumns: ['id', 'name'],
          entityName: 'โปรแกรม',
        }),

        processRow: async (row, headerMap, config, user, rowNumber) => {
          const result = await this.extractAndValidateProgramData(row, headerMap, config, user);
          if (typeof result === 'string') {
            return { error: result };
          }
          return { data: result };
        },

        createEntity: (data: ProgramData) => this.createProgramEntity(data),

        prisma: this.prisma
      });
    }
    return this.xlsxImportService;
  }

  // =============================================================================
  // PRIVATE METHODS - DATA PROCESSING
  // =============================================================================

  /**
   * ดึงและ validate ข้อมูลโปรแกรมจากแถว Excel
   * @private
   * @param row - แถวข้อมูลจาก Excel
   * @param headerMap - mapping header กับ index
   * @param config - configuration การ import
   * @param user - ผู้ใช้ที่ทำการ import
   * @returns ข้อมูลโปรแกรมที่ validate แล้ว หรือข้อความ error
   */
  private async extractAndValidateProgramData(
    row: any[],
    headerMap: Record<string, number>,
    config: XlsxImportConfig<ProgramData>,
    user: any
  ): Promise<ProgramData | string> {
    const programId = extractCellValue(row, headerMap, config.columnMapping, 'id');
    const name = extractCellValue(row, headerMap, config.columnMapping, 'name');
    const description = extractCellValue(row, headerMap, config.columnMapping, 'description') || '';

    const validationError = validateRequiredFields(
      { programId, name },
      ['programId', 'name']
    );

    if (validationError) {
      return validationError;
    }

    const existingProgram = await this.checkProgramExists(programId);
    if (existingProgram) {
      return `โปรแกรมรหัส "${programId}" มีอยู่ในระบบแล้ว`;
    }

    return {
      programId,
      name,
      description,
      createdBy: user.username,
      updatedBy: user.username,
    };
  }

  // =============================================================================
  // PRIVATE METHODS - DATABASE QUERIES
  // =============================================================================

  /**
   * ตรวจสอบว่าโปรแกรมมีอยู่ในระบบแล้วหรือไม่
   * @private
   * @param programId - รหัสโปรแกรมที่ต้องการตรวจสอบ
   * @returns โปรแกรมที่พบ หรือ null
   */
  private async checkProgramExists(programId: string) {
    return this.prisma.program.findUnique({
      where: { programId },
    });
  }

  /**
   * สร้าง entity โปรแกรมในฐานข้อมูล
   * @private
   * @param data - ข้อมูลโปรแกรมที่จะสร้าง
   * @returns entity โปรแกรมที่สร้างแล้ว
   */
  private async createProgramEntity(data: ProgramData): Promise<any> {
    const dateTimeInit = new Date();
    return this.prisma.program.create({
      data: {
        ...data,
        createdAt: dateTimeInit,
        updatedAt: dateTimeInit,
      },
    });
  }
}
